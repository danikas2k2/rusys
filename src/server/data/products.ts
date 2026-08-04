import type { AnyBulkWriteOperation, ClientSession, Filter, UpdateFilter, WithId } from 'mongodb';

import { addVariantAmount, getCombinedAmounts, getVariantAmount } from '~/common/utils/amounts';
import { DAY_MS, HOUR_MS, QUARTER_HOUR_MS, THREE_MONTHS_MS, WEEK_MS } from '~/common/utils/time';
import { buildHistoryPipeline } from '~/server/data/history';
import { deleteImage } from '~/server/data/images';
import { resolveImage } from '~/server/data/resolveImage';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db, withTransaction } from '~/server/db';
import type { History, Product, Update, VariantAmount, YearAmounts } from '~/types/data';

export async function getProducts(years: readonly number[] = []): Promise<Product[]> {
    const col = (await db()).collection('products');
    const match: Filter<Product> = years.length
        ? {
              $or: [
                  { years: { $exists: false } },
                  { years: { $size: 0 } },
                  { 'years.year': { $in: years } } as Filter<Product>,
              ],
          }
        : {};
    return col
        .aggregate<Product>([
            { $match: match },
            {
                $project: {
                    _id: 0,
                    group: 1,
                    name: 1,
                    parent: 1,
                    years: 1,
                    missing: 1,
                    image: 1,
                    variantImages: 1,
                    updates: {
                        $cond: [
                            { $gt: [{ $size: { $ifNull: ['$updates', []] } }, 0] },
                            {
                                $reduce: {
                                    input: '$updates',
                                    initialValue: [],
                                    in: {
                                        $concatArrays: [
                                            '$$value',
                                            { $map: { input: '$$this.years', as: 'y', in: { year: '$$y.year' } } },
                                        ],
                                    },
                                },
                            },
                            '$$REMOVE',
                        ],
                    },
                    undates: {
                        $cond: [
                            { $gt: [{ $size: { $ifNull: ['$undates', []] } }, 0] },
                            {
                                $reduce: {
                                    input: '$undates',
                                    initialValue: [],
                                    in: {
                                        $concatArrays: [
                                            '$$value',
                                            { $map: { input: '$$this.years', as: 'y', in: { year: '$$y.year' } } },
                                        ],
                                    },
                                },
                            },
                            '$$REMOVE',
                        ],
                    },
                },
            },
            { $sort: { group: 1, name: 1, 'years.year': 1 } },
        ])
        .toArray();
}

export async function getProductVariants(
    group: string,
    name: string,
    session?: ClientSession
): Promise<readonly string[] | undefined> {
    if (!group || !name) {
        return undefined;
    }
    const col = (await db()).collection('products');
    const concatVariants = {
        $concatArrays: ['$$value', { $map: { input: '$$this.amounts', as: 'a', in: '$$a.variant' } }],
    };
    const collectCurrentVariants = { $reduce: { input: '$years', initialValue: [], in: concatVariants } };
    const collectUpdateVariants = { $reduce: { input: '$$this.years', initialValue: [], in: concatVariants } };
    const concatUpdateVariants = { $concatArrays: ['$$value', collectUpdateVariants] };
    const collectUpdatesVariants = { $reduce: { input: '$updates', initialValue: [], in: concatUpdateVariants } };
    return (
        await col
            .aggregate<{
                variants?: string[];
            }>(
                [
                    { $match: { group, name } },
                    { $project: { allVariants: { $setUnion: [collectCurrentVariants, collectUpdatesVariants] } } },
                    { $unwind: '$allVariants' },
                    { $group: { _id: null, variants: { $addToSet: '$allVariants' } } },
                    { $project: { _id: 0, variants: 1 } },
                ],
                { session }
            )
            .next()
    )?.variants;
}

export async function addProduct(group: string, name: string, parent?: string): Promise<boolean> {
    if (!group || !name || parent === name) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    if (parent && !(await col.findOne({ group, name: parent }))) {
        return false;
    }
    return col.insertOne({ group, name, ...(parent ? { parent } : {}) }).then(hasEffect);
}

export const cleanupRecycled = ({ recycled, suspicious, home, expiresAt, ...v }: VariantAmount): VariantAmount => ({
    ...v,
    ...(recycled != null ? { recycled } : {}),
    ...(suspicious ? { suspicious } : {}),
    ...(home ? { home } : {}),
    ...(expiresAt ? { expiresAt } : {}),
});

export const hasAmount = (a: VariantAmount) => a.amount > 0;

export async function updateProduct(
    group: string,
    name: string,
    year: number,
    changes: readonly VariantAmount[] = [],
    user?: string,
    comment?: string
): Promise<boolean> {
    if (!group || !name || !changes.length) {
        return false;
    }

    return withTransaction(async (session) => {
        const filter: UpdateFilter<Product> = { group, name };
        const operations: AnyBulkWriteOperation<Product>[] = [];

        const col = (await db()).collection<Product>('products');
        const product = await col.findOne(filter, {
            projection: { years: 1, missing: 1, updates: 1 },
            session,
        });
        const amounts =
            (year ? product?.years?.find((y) => y.year === year)?.amounts : getCombinedAmounts(product?.years)) ?? [];

        // auto-consume home balance when cellar consumption starts for that variant
        const autoHomeConsumes: VariantAmount[] = [];
        for (const change of changes) {
            if (!change.home && change.recycled === false && change.amount < 0) {
                const homeBalance = getVariantAmount(amounts, change.variant, false, true);
                if (homeBalance > 0) {
                    autoHomeConsumes.push({
                        variant: change.variant,
                        amount: -homeBalance,
                        recycled: false,
                        home: true,
                    });
                }
            }
        }
        const allChanges = autoHomeConsumes.length ? [...changes, ...autoHomeConsumes] : changes;

        const updates = allChanges.reduce(addVariantAmount, amounts).filter(hasAmount).map(cleanupRecycled);

        // save all change types (consumed=recycled:false, recycled=recycled:true, updated=no recycled field)
        const historyAmounts = allChanges.map(cleanupRecycled);
        const newEntry = {
            time: Date.now(),
            user,
            ...(comment ? { comment } : {}),
            years: [{ year, amounts: historyAmounts }],
        };
        const newUpdates = [...(product?.updates ?? []), newEntry];
        // clear undates on new update
        operations.push({ updateOne: { filter, update: { $set: { updates: newUpdates }, $unset: { undates: 1 } } } });

        // no updates
        if (!updates.length) {
            if (!amounts.length) {
                return false;
            }
            operations.push({
                updateOne: {
                    filter,
                    update: year ? { $pull: { years: { year } } } : { $unset: { years: 1, missing: 1 } },
                },
            });
        } else if (!amounts.length) {
            operations.push({ updateOne: { filter, update: { $push: { years: { year, amounts: updates } } } } });
        } else {
            operations.push({
                updateOne: year
                    ? {
                          filter,
                          update: { $set: { 'years.$[y].amounts': updates } },
                          arrayFilters: [{ 'y.year': year }],
                      }
                    : {
                          filter,
                          update: { $set: { years: [{ year, amounts: updates }] } },
                      },
            });
        }

        // remove missing flag if amount decreased but not recycled
        if (product?.missing && changes.some((a) => !a.recycled && a.amount < 0)) {
            operations.push({ updateOne: { filter, update: { $unset: { missing: 1 } } } });
        }

        // clear all other empty years
        operations.push({
            updateOne: {
                filter: { group, name, years: { $size: 0 } },
                update: { $unset: { years: 1, missing: 1 } },
            },
        });

        return await col.bulkWrite(operations, { session }).then(hasEffect);
    });
}

// Mirrors the dynamic session-gap logic in buildHistoryPipeline's sessionGap: recent activity is
// grouped into tight 15-minute sessions, older activity into progressively coarser buckets.
function sessionGapMs(entryTime: number, now: number): number {
    const age = now - entryTime;
    if (age < WEEK_MS) {
        return QUARTER_HOUR_MS;
    }
    return age < THREE_MONTHS_MS ? HOUR_MS : DAY_MS;
}

function inSameSession(prevTime: number, nextTime: number, now: number): boolean {
    return nextTime - prevTime <= sessionGapMs(prevTime, now);
}

// Replicates buildHistoryPipeline's per-user session grouping in JS: walks outward from the
// clicked history row's own time (a real, exact entry time) to the full contiguous run of that
// user's entries, so the edit lands on exactly the raw entries the displayed row was summed from.
function findSessionEntries(sortedSameUser: readonly Update[], anchorTime: number, now: number): Update[] {
    const anchorIndex = sortedSameUser.findIndex((u) => u.time === anchorTime);
    if (anchorIndex === -1) {
        return [];
    }
    let start = anchorIndex;
    while (start > 0 && inSameSession(sortedSameUser[start - 1].time, sortedSameUser[start].time, now)) {
        start--;
    }
    let end = anchorIndex;
    while (
        end < sortedSameUser.length - 1 &&
        inSameSession(sortedSameUser[end].time, sortedSameUser[end + 1].time, now)
    ) {
        end++;
    }
    return sortedSameUser.slice(start, end + 1);
}

function sameFlags(a: VariantAmount, flags: Pick<VariantAmount, 'suspicious' | 'home' | 'expiresAt'>): boolean {
    return !!a.suspicious === !!flags.suspicious && !!a.home === !!flags.home && a.expiresAt === flags.expiresAt;
}

export async function moveConsumedToRecycled(
    group: string,
    name: string,
    year: number,
    time: number,
    variant: string,
    amount: number,
    flags: Pick<VariantAmount, 'suspicious' | 'home' | 'expiresAt'> = {},
    user?: string
): Promise<boolean> {
    if (!group || !name || !variant || !(amount > 0)) {
        return false;
    }

    return withTransaction(async (session) => {
        const filter: UpdateFilter<Product> = { group, name };
        const col = (await db()).collection<Product>('products');
        const product = await col.findOne(filter, { projection: { updates: 1 }, session });
        const updates = (product?.updates ?? []) as Update[];

        // Locate entries by the row's own author, not the current viewer — the amount may have
        // been consumed by one person and correctly belongs to that person's history session
        // regardless of who is now reclassifying it as discarded.
        const userKey = (user ?? '').toLowerCase();
        const sameUserSorted = updates
            .filter((u) => (u.user ?? '').toLowerCase() === userKey)
            .sort((a, b) => a.time - b.time);
        const sessionEntries = findSessionEntries(sameUserSorted, time, Date.now());

        // Reduce the magnitude of the actual stored consumed amount(s) rather than adding a
        // compensating positive entry — summary totals only accumulate negative amounts, so a
        // "+X consumed" correction would silently vanish from consumed totals instead of
        // reducing them.
        let remaining = amount;
        let target: { year: YearAmounts } | undefined;

        for (const entry of sessionEntries) {
            if (remaining <= 0) {
                break;
            }
            const yearEntry = entry.years.find((y) => y.year === year);
            if (!yearEntry) {
                continue;
            }
            for (const a of yearEntry.amounts) {
                if (remaining <= 0) {
                    break;
                }
                if (a.variant === variant && a.recycled === false && a.amount < 0 && sameFlags(a, flags)) {
                    const take = Math.min(remaining, -a.amount);
                    a.amount += take;
                    remaining -= take;
                    target ??= { year: yearEntry };
                }
            }
        }

        const moved = amount - remaining;
        if (!target || moved <= 0) {
            return false;
        }

        target.year.amounts = [...target.year.amounts, { variant, amount: -moved, recycled: true, ...flags }];

        return col.updateOne(filter, { $set: { updates }, $unset: { undates: 1 } }, { session }).then(hasEffect);
    });
}

function invertAmounts(amounts: readonly VariantAmount[]): VariantAmount[] {
    return amounts.map((a) => ({ ...a, amount: -a.amount }));
}

export async function undoProduct(group: string, name: string, year: number): Promise<boolean> {
    if (!group || !name) {
        return false;
    }

    return withTransaction(async (session) => {
        const filter: UpdateFilter<Product> = { group, name };
        const col = (await db()).collection<Product>('products');
        const product = await col.findOne(filter, {
            projection: { years: 1, updates: 1, undates: 1 },
            session,
        });

        const updates = (product?.updates ?? []) as Update[];
        const entryIndex = [...updates].reverse().findIndex((u) => u.years.some((y) => y.year === year));
        if (entryIndex === -1) {
            return false;
        }
        const realIndex = updates.length - 1 - entryIndex;
        const entry = updates[realIndex];
        const newUpdates = [...updates.slice(0, realIndex), ...updates.slice(realIndex + 1)];
        const newUndates = [...(product?.undates ?? []), entry];

        const operations: AnyBulkWriteOperation<Product>[] = [
            { updateOne: { filter, update: { $set: { updates: newUpdates, undates: newUndates } } } },
        ];

        // apply inverted amounts to years
        for (const { year: entryYear, amounts: entryAmounts } of entry.years) {
            const inverted = invertAmounts(entryAmounts);
            const currentAmounts =
                (entryYear
                    ? product?.years?.find((y) => y.year === entryYear)?.amounts
                    : getCombinedAmounts(product?.years)) ?? [];
            const newAmounts = inverted.reduce(addVariantAmount, currentAmounts).filter(hasAmount).map(cleanupRecycled);

            if (!newAmounts.length) {
                operations.push({
                    updateOne: {
                        filter,
                        update: entryYear ? { $pull: { years: { year: entryYear } } } : { $unset: { years: 1 } },
                    },
                });
            } else if (!currentAmounts.length) {
                operations.push({
                    updateOne: { filter, update: { $push: { years: { year: entryYear, amounts: newAmounts } } } },
                });
            } else {
                operations.push({
                    updateOne: entryYear
                        ? {
                              filter,
                              update: { $set: { 'years.$[y].amounts': newAmounts } },
                              arrayFilters: [{ 'y.year': entryYear }],
                          }
                        : {
                              filter,
                              update: { $set: { years: [{ year: entryYear, amounts: newAmounts }] } },
                          },
                });
            }
        }

        operations.push({
            updateOne: {
                filter: { group, name, years: { $size: 0 } },
                update: { $unset: { years: 1, missing: 1 } },
            },
        });

        return await col.bulkWrite(operations, { session }).then(hasEffect);
    });
}

export async function redoProduct(group: string, name: string, year: number): Promise<boolean> {
    if (!group || !name) {
        return false;
    }

    return withTransaction(async (session) => {
        const filter: UpdateFilter<Product> = { group, name };
        const col = (await db()).collection<Product>('products');
        const product = await col.findOne(filter, {
            projection: { years: 1, updates: 1, undates: 1 },
            session,
        });

        const undates = (product?.undates ?? []) as Update[];
        const entryIndex = [...undates].reverse().findIndex((u) => u.years.some((y) => y.year === year));
        if (entryIndex === -1) {
            return false;
        }
        const realIndex = undates.length - 1 - entryIndex;
        const entry = undates[realIndex];
        const newUndates = [...undates.slice(0, realIndex), ...undates.slice(realIndex + 1)];
        const newUpdates = [...(product?.updates ?? []), entry];

        const operations: AnyBulkWriteOperation<Product>[] = [
            {
                updateOne: {
                    filter,
                    update: newUndates.length
                        ? { $set: { updates: newUpdates, undates: newUndates } }
                        : { $set: { updates: newUpdates }, $unset: { undates: 1 } },
                },
            },
        ];

        // re-apply original amounts to years
        for (const { year: entryYear, amounts: entryAmounts } of entry.years) {
            const currentAmounts =
                (entryYear
                    ? product?.years?.find((y) => y.year === entryYear)?.amounts
                    : getCombinedAmounts(product?.years)) ?? [];
            const newAmounts = entryAmounts
                .reduce(addVariantAmount, currentAmounts)
                .filter(hasAmount)
                .map(cleanupRecycled);

            if (!newAmounts.length) {
                operations.push({
                    updateOne: {
                        filter,
                        update: entryYear ? { $pull: { years: { year: entryYear } } } : { $unset: { years: 1 } },
                    },
                });
            } else if (!currentAmounts.length) {
                operations.push({
                    updateOne: { filter, update: { $push: { years: { year: entryYear, amounts: newAmounts } } } },
                });
            } else {
                operations.push({
                    updateOne: entryYear
                        ? {
                              filter,
                              update: { $set: { 'years.$[y].amounts': newAmounts } },
                              arrayFilters: [{ 'y.year': entryYear }],
                          }
                        : {
                              filter,
                              update: { $set: { years: [{ year: entryYear, amounts: newAmounts }] } },
                          },
                });
            }
        }

        operations.push({
            updateOne: {
                filter: { group, name, years: { $size: 0 } },
                update: { $unset: { years: 1, missing: 1 } },
            },
        });

        return await col.bulkWrite(operations, { session }).then(hasEffect);
    });
}

export async function setImage(group: string, name: string, image: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    const existing = await col.findOne({ group, name });
    const resolved = await resolveImage(image, existing?.image);
    return col.updateOne({ group, name }, { $set: { image: resolved } }).then(hasEffect);
}

export async function setVariantImage(group: string, name: string, variant: string, image: string): Promise<boolean> {
    if (!group || !name || !variant) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    const existing = await col.findOne({ group, name });
    const resolved = await resolveImage(image, existing?.variantImages?.[variant]);
    return col.updateOne({ group, name }, { $set: { [`variantImages.${variant}`]: resolved } }).then(hasEffect);
}

export async function renameProduct(
    group: string,
    name: string,
    newName: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !newName || name === newName) {
        return false;
    }
    const col = (await db()).collection('products');
    const renamed = await col
        .updateOne({ group, name }, { $set: { name: newName } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
    if (renamed) {
        // Keep children pointing at the renamed product.
        await col.updateMany({ group, parent: name }, { $set: { parent: newName } }, { session });
    }
    return renamed;
}

function getDescendantNames(name: string, childrenByParent: ReadonlyMap<string, readonly string[]>): Set<string> {
    const descendants = new Set<string>();
    const stack = [name];
    while (stack.length) {
        for (const child of childrenByParent.get(stack.pop()!) ?? []) {
            if (!descendants.has(child)) {
                descendants.add(child);
                stack.push(child);
            }
        }
    }
    return descendants;
}

export async function setProductParent(group: string, name: string, parent?: string): Promise<boolean> {
    if (!group || !name || parent === name) {
        return false;
    }

    return withTransaction(async (session) => {
        const col = (await db()).collection<Product>('products');
        if (!parent) {
            return col.updateOne({ group, name }, { $unset: { parent: 1 } }, { session }).then(hasEffect);
        }

        const siblings = await col.find({ group }, { projection: { _id: 0, name: 1, parent: 1 }, session }).toArray();
        if (!siblings.some((p) => p.name === parent)) {
            return false;
        }

        const childrenByParent = new Map<string, string[]>();
        for (const p of siblings) {
            if (p.parent) {
                childrenByParent.set(p.parent, [...(childrenByParent.get(p.parent) ?? []), p.name]);
            }
        }
        // Setting parent to one of name's own descendants would create a cycle.
        if (getDescendantNames(name, childrenByParent).has(parent)) {
            return false;
        }

        return col.updateOne({ group, name }, { $set: { parent } }, { session }).then(hasEffect);
    });
}

export async function renameProductsVariant(
    group: string,
    variant: string,
    newVariant: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !variant || !newVariant || variant === newVariant) {
        return false;
    }
    const updateYearAmounts = {
        $cond: [
            { $isArray: '$$year.amounts' },
            {
                $mergeObjects: [
                    '$$year',
                    {
                        amounts: {
                            $map: {
                                input: '$$year.amounts',
                                as: 'a',
                                in: {
                                    $cond: [
                                        { $eq: ['$$a.variant', variant] },
                                        { $mergeObjects: ['$$a', { variant: newVariant }] },
                                        '$$a',
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
            '$$year',
        ],
    };

    return (await db())
        .collection('products')
        .bulkWrite(
            [
                {
                    updateMany: {
                        filter: { group, 'years.amounts.variant': variant } as UpdateFilter<Product>,
                        update: [
                            {
                                $set: {
                                    years: {
                                        $map: {
                                            input: '$years',
                                            as: 'year',
                                            in: updateYearAmounts,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years.amounts.variant': variant } as UpdateFilter<Product>,
                        update: [
                            {
                                $set: {
                                    updates: {
                                        $map: {
                                            input: '$updates',
                                            as: 'upd',
                                            in: {
                                                $mergeObjects: [
                                                    '$$upd',
                                                    {
                                                        years: {
                                                            $map: {
                                                                input: '$$upd.years',
                                                                as: 'year',
                                                                in: updateYearAmounts,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
            { session }
        )
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function renameProductsGroup(group: string, newGroup: string, session?: ClientSession): Promise<boolean> {
    if (!group || !newGroup || group === newGroup) {
        return false;
    }
    return (await db())
        .collection('products')
        .updateMany({ group }, { $set: { group: newGroup } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function moveProduct(
    group: string,
    name: string,
    newGroup: string,
    newName?: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !newGroup || group === newGroup) {
        return false;
    }
    const $set: { group: string; name?: string } = { group: newGroup };
    if (newName && name !== newName) {
        $set.name = newName;
    }
    return (
        (await db())
            .collection('products')
            // parent is scoped to the old group, so it's no longer valid once the group changes.
            .updateOne({ group, name }, { $set, $unset: { parent: 1 } }, { session })
            .then(hasEffect)
            .catch(hasDuplicates)
    );
}

export async function deleteProduct(group: string, name: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    if (await col.countDocuments({ group, parent: name })) {
        return false;
    }
    const existing = await col.findOne({ group, name });
    const deleted = await col.deleteOne({ group, name }).then(hasEffect);
    if (deleted) {
        await deleteImage(existing?.image);
        await Promise.all(Object.values(existing?.variantImages ?? {}).map((image) => deleteImage(image)));
    }
    return deleted;
}

export async function deleteProductsVariant(group: string, variant: string, session?: ClientSession): Promise<boolean> {
    if (!group || !variant) {
        return false;
    }
    return (await db())
        .collection('products')
        .bulkWrite(
            [
                {
                    updateMany: {
                        filter: { group, 'years.amounts.variant': variant } as UpdateFilter<Product>,
                        update: { $pull: { 'years.$[].amounts': { variant } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'years.amounts': { $size: 0 } } as UpdateFilter<Product>,
                        update: { $pull: { years: { amounts: { $size: 0 } } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, years: { $size: 0 } },
                        update: { $unset: { years: 1 } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years.amounts.variant': variant } as UpdateFilter<Product>,
                        update: { $pull: { 'updates.$[].years.$[].amounts': { variant } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years.amounts': { $size: 0 } } as UpdateFilter<Product>,
                        update: { $pull: { 'updates.$[].years': { amounts: { $size: 0 } } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years': { $size: 0 } } as UpdateFilter<Product>,
                        update: { $pull: { updates: { years: { $size: 0 } } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, updates: { $size: 0 } },
                        update: { $unset: { updates: 1 } },
                    },
                },
            ],
            { session }
        )
        .then(hasEffect);
}

export async function deleteProductsGroup(group: string, session?: ClientSession): Promise<boolean> {
    if (!group) {
        return false;
    }
    return (await db()).collection('products').deleteMany({ group }, { session }).then(hasEffect);
}

export async function setRemoving(
    group: string,
    name: string,
    year: number,
    removing: boolean,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !year) {
        return false;
    }
    return (await db())
        .collection('products')
        .updateOne(
            { group, name, 'years.year': year } as Filter<Product>,
            { [removing ? '$set' : '$unset']: { 'years.$.removing': removing } },
            { session }
        )
        .then(hasEffect);
}

export async function setMissing(
    group: string,
    name: string,
    missing: boolean,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db())
        .collection('products')
        .updateOne({ group, name }, { [missing ? '$set' : '$unset']: { missing } }, { session })
        .then(hasEffect);
}

export async function setMissingBulk(
    updates: readonly { group: string; name: string; missing: boolean }[],
    session?: ClientSession
): Promise<boolean> {
    if (!updates?.length) {
        return false;
    }
    const operations: AnyBulkWriteOperation<Product>[] = updates.map(({ group, name, missing }) => ({
        updateOne: {
            filter: { group, name },
            update: missing ? { $set: { missing: true } } : { $unset: { missing: 1 } },
        },
    }));
    return (await db()).collection('products').bulkWrite(operations, { session }).then(hasEffect);
}

async function getProductHistory(
    group: string,
    name: string,
    year: number,
    field: 'updates' | 'undates'
): Promise<History[]> {
    return (await db())
        .collection('products')
        .aggregate<WithId<History>>(
            buildHistoryPipeline(group, name, field, { [`${field}.years`]: { $elemMatch: { year } } }, undefined, {
                $eq: ['$$y.year', year],
            })
        )
        .toArray();
}

export async function getProductUpdates(group: string, name: string, year: number): Promise<History[]> {
    return getProductHistory(group, name, year, 'updates');
}

export async function getProductUndates(group: string, name: string, year: number): Promise<History[]> {
    return getProductHistory(group, name, year, 'undates');
}
