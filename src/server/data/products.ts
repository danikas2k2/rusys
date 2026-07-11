import type { AnyBulkWriteOperation, ClientSession, Filter, UpdateFilter } from 'mongodb';

import { addVariantAmount, getCombinedAmounts } from '~/common/utils/amounts';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db, withTransaction } from '~/server/db';
import type { Product, Update, VariantAmount } from '~/types/data';

export async function getProducts(years: readonly number[] = []): Promise<Product[]> {
    const col = (await db()).collection('products');
    const filter: Filter<Product> = years.length
        ? {
              $or: [
                  { years: { $exists: false } },
                  { years: { $size: 0 } },
                  { 'years.year': { $in: years } } as Filter<Product>,
              ],
          }
        : {};
    return col
        .find(filter, { projection: { _id: 0, updates: 0, removes: 0 }, sort: { group: 1, name: 1, 'years.year': 1 } })
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

export async function addProduct(group: string, name: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db()).collection('products').insertOne({ group, name }).then(hasEffect);
}

export const cleanupRecycled = ({ recycled, ...v }: VariantAmount): VariantAmount =>
    recycled ? { ...v, recycled } : v;

export const hasAmount = (a: VariantAmount) => a.amount > 0;

export function applyCorrectionsToUpdates(
    existingUpdates: readonly Update[],
    year: number,
    corrections: readonly VariantAmount[]
): readonly Update[] {
    if (!corrections.length) {
        return existingUpdates;
    }

    // remaining delta per variant (positive = need to reduce consumed/recycled amounts)
    const remaining = new Map<string, number>(corrections.map((c) => [c.variant, c.amount]));

    const result = [...existingUpdates].reverse().map((u) => {
        const yi = u.years.findIndex((y) => y.year === year);
        if (yi === -1) {
            return u;
        }

        const yearEntry = u.years[yi];
        const newAmounts = yearEntry.amounts
            .map((a) => {
                const delta = remaining.get(a.variant);
                // only adjust negative amounts (consumed/recycled); skip positive (added inventory)
                if (delta === undefined || delta === 0 || a.amount >= 0) {
                    return a;
                }
                const newAmount = a.amount + delta;
                // cap at 0: can't un-consume more than what's in this entry
                const capped = Math.min(newAmount, 0);
                remaining.set(a.variant, delta - (capped - a.amount));
                return { ...a, amount: capped };
            })
            .filter((a) => a.amount !== 0);

        const newYears =
            newAmounts.length === 0
                ? u.years.filter((_, i) => i !== yi)
                : u.years.map((y, i) => (i === yi ? { ...y, amounts: newAmounts } : y));

        return { ...u, years: newYears };
    });

    return result.reverse().filter((u) => u.years.length > 0);
}

export async function updateProduct(
    group: string,
    name: string,
    year: number,
    changes: readonly VariantAmount[] = [],
    user?: string
): Promise<boolean> {
    if (!group || !name || !changes.length) {
        return false;
    }

    return withTransaction(async (session) => {
        const filter: UpdateFilter<Product> = { group, name };

        const historyChanges = changes.filter((v) => v.recycled != null).map(cleanupRecycled);
        const correctionChanges = changes.filter((v) => v.recycled == null);

        const operations: AnyBulkWriteOperation<Product>[] = [];

        // calculates amount updates
        const col = (await db()).collection<Product>('products');
        const product = await col.findOne(filter, { projection: { years: 1, missing: 1, updates: 1 }, session });
        const amounts =
            (year ? product?.years?.find((y) => y.year === year)?.amounts : getCombinedAmounts(product?.years)) ?? [];
        const updates = changes
            // update amounts
            .reduce(addVariantAmount, amounts)
            // remove invalid amounts
            .filter(hasAmount)
            // remove recycled if not set
            .map(cleanupRecycled);

        // build the new updates array: apply corrections to history, then append new history entry if any
        const baseUpdates = correctionChanges.length
            ? applyCorrectionsToUpdates(product?.updates ?? [], year, correctionChanges)
            : product?.updates;

        if (historyChanges.length) {
            const newEntry = { time: Date.now(), user, years: [{ year, amounts: historyChanges }] };
            const newUpdates = baseUpdates ? [...baseUpdates, newEntry] : [newEntry];
            operations.push({ updateOne: { filter, update: { $set: { updates: newUpdates } } } });
        } else if (correctionChanges.length) {
            operations.push({ updateOne: { filter, update: { $set: { updates: baseUpdates ?? [] } } } });
        }

        // no updates
        if (!updates.length) {
            // and currently no amounts
            if (!amounts.length) {
                // do nothing
                return false;
            }
            // remove year
            operations.push({
                updateOne: {
                    filter,
                    update: year ? { $pull: { years: { year } } } : { $unset: { years: 1, missing: 1 } },
                },
            });
        } else if (!amounts.length) {
            // add year if not exists
            operations.push({ updateOne: { filter, update: { $push: { years: { year, amounts: updates } } } } });
        } else {
            // update amounts
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

export async function renameProduct(group: string, name: string, newName: string): Promise<boolean> {
    if (!group || !name || !newName || name === newName) {
        return false;
    }
    return (await db())
        .collection('products')
        .updateOne({ group, name }, { $set: { name: newName } })
        .then(hasEffect)
        .catch(hasDuplicates);
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
    return (await db())
        .collection('products')
        .updateOne({ group, name }, { $set }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function deleteProduct(group: string, name: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db()).collection('products').deleteOne({ group, name }).then(hasEffect);
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
