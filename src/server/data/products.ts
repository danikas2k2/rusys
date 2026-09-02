import type { AnyBulkWriteOperation, ClientSession, Collection, Filter, UpdateFilter, WithId } from 'mongodb';

import type { History, Product, Update, VariantAmount } from '~/common/data';
import { addVariantAmount, getCombinedAmounts, getVariantAmount } from '~/common/utils/amounts';
import { buildHistoryPipeline } from '~/server/data/history';
import { classifyImage } from '~/server/data/images';
import { imageFieldUpdate, resolveImage } from '~/server/data/resolveImage';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db, withTransaction } from '~/server/db';

// Backfills `photo` for any `image`/`variantImages` entry left by a pre-classification version of
// the app that turns out to actually be a photo, persisting the result so future reads skip this
// recomputation. An `image` with no `photo` that's genuinely icon-sized is left alone (nothing to
// persist), and gets re-checked - cheaply - on every read, since there's no separate marker for
// "confirmed icon" vs "never checked".
async function migrateProductImages(col: Collection<Product>, product: Product): Promise<Product> {
    const staleVariants = Object.entries(product.variantImages ?? {}).filter(
        ([variant, url]) => url && !product.variantPhotos?.[variant]
    );
    if (!product.image && !staleVariants.length) {
        return product;
    }

    const $set: Record<string, string> = {};
    let { image, photo } = product;
    if (image && !photo) {
        const classified = await classifyImage(image);
        if (classified.photo) {
            image = classified.image;
            photo = classified.photo;
            $set.image = classified.image;
            $set.photo = classified.photo;
        }
    }
    const variantImages = { ...product.variantImages };
    const variantPhotos = { ...product.variantPhotos };
    for (const [variant, url] of staleVariants) {
        const classified = await classifyImage(url);
        if (classified.photo) {
            variantImages[variant] = classified.image;
            variantPhotos[variant] = classified.photo;
            $set[`variantImages.${variant}`] = classified.image;
            $set[`variantPhotos.${variant}`] = classified.photo;
        }
    }
    if (Object.keys($set).length) {
        await col.updateOne({ group: product.group, name: product.name }, { $set });
    }
    return { ...product, image, photo, variantImages, variantPhotos };
}

export async function getProducts(years: readonly number[] = []): Promise<Product[]> {
    const database = await db();
    const col = database.collection<Product>('products');
    // A category archive is inherited by its products.  We deliberately keep the product
    // document itself intact: historical summary queries read it independently of this list.
    const archivedGroups = await database
        .collection('groups')
        .find({ archivedAt: { $exists: true } }, { projection: { _id: 0, group: 1 } })
        .toArray();
    const match: Filter<Product> = {
        archivedAt: { $exists: false },
        group: { $nin: archivedGroups.map(({ group }) => group) },
        ...(years.length
            ? {
                  $or: [
                      { years: { $exists: false } },
                      { years: { $size: 0 } },
                      { 'years.year': { $in: years } } as Filter<Product>,
                  ],
              }
            : {}),
    };
    return col
        .aggregate<Product>([
            { $match: match },
            {
                $project: {
                    _id: 0,
                    group: 1,
                    name: 1,
                    parent: 1,
                    expiryToleranceDays: 1,
                    years: 1,
                    missing: 1,
                    image: 1,
                    photo: 1,
                    variantImages: 1,
                    variantPhotos: 1,
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
        .toArray()
        .then((products) => Promise.all(products.map((p) => migrateProductImages(col, p))));
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
    if (parent && !(await col.findOne({ group, name: parent, archivedAt: { $exists: false } }))) {
        return false;
    }
    // Names are still the current identity key.  Re-adding an archived name therefore means
    // restoring its original record rather than silently creating a second, ambiguous history.
    const archived = await col.findOne({ group, name, archivedAt: { $exists: true } });
    if (archived) {
        return col
            .updateOne({ group, name }, { $unset: { archivedAt: 1 }, ...(parent ? { $set: { parent } } : {}) })
            .then(hasEffect);
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

export async function setAmounts(
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

export async function moveConsumedToRecycled(
    group: string,
    name: string,
    year: number,
    variant: string,
    amount: number,
    flags: Pick<VariantAmount, 'suspicious' | 'home' | 'expiresAt'> = {},
    user?: string
): Promise<boolean> {
    if (!group || !name || !variant || !(amount > 0)) {
        return false;
    }

    const col = (await db()).collection<Product>('products');
    // Leaves old history untouched and records the correction as its own update entry (net
    // effect on current stock is zero) so it plays nicely with undo/redo like any other update.
    const newEntry: Update = {
        time: Date.now(),
        user,
        years: [
            {
                year,
                amounts: [
                    cleanupRecycled({ variant, amount, recycled: false, ...flags }),
                    cleanupRecycled({ variant, amount: -amount, recycled: true, ...flags }),
                ],
            },
        ],
    };

    return col.updateOne({ group, name }, { $push: { updates: newEntry }, $unset: { undates: 1 } }).then(hasEffect);
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
    const resolved = await resolveImage(image, existing?.image, existing?.photo);
    const { $set, $unset } = imageFieldUpdate(resolved, 'image', 'photo');
    return col
        .updateOne(
            { group, name },
            { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}) }
        )
        .then(hasEffect);
}

export async function setVariantImage(group: string, name: string, variant: string, image: string): Promise<boolean> {
    if (!group || !name || !variant) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    const existing = await col.findOne({ group, name });
    const resolved = await resolveImage(image, existing?.variantImages?.[variant], existing?.variantPhotos?.[variant]);
    const { $set, $unset } = imageFieldUpdate(resolved, `variantImages.${variant}`, `variantPhotos.${variant}`);
    return col
        .updateOne(
            { group, name },
            { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}) }
        )
        .then(hasEffect);
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

export async function setProductExpiryTolerance(
    group: string,
    name: string,
    expiryToleranceDays: number
): Promise<boolean> {
    if (!group || !name || !Number.isInteger(expiryToleranceDays) || expiryToleranceDays < 0) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    return expiryToleranceDays
        ? col.updateOne({ group, name }, { $set: { expiryToleranceDays } }).then(hasEffect)
        : col.updateOne({ group, name }, { $unset: { expiryToleranceDays: 1 } }).then(hasEffect);
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
    if (await col.countDocuments({ group, parent: name, archivedAt: { $exists: false } })) {
        return false;
    }
    return col
        .updateOne({ group, name, archivedAt: { $exists: false } }, { $set: { archivedAt: Date.now() } })
        .then(hasEffect);
}

export async function deleteProductsVariant(
    _group: string,
    _variant: string,
    _session?: ClientSession
): Promise<boolean> {
    // Kept only as a compatibility boundary for old callers. Variant history is embedded in
    // products, so there is intentionally nothing to erase here.
    return false;
}

export async function deleteProductsGroup(_group: string, _session?: ClientSession): Promise<boolean> {
    // Category archiving is inherited by products; do not mark each child or erase its history.
    return false;
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
