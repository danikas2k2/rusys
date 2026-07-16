import type { AnyBulkWriteOperation, ClientSession, Filter, UpdateFilter } from 'mongodb';

import { addVariantAmount, getCombinedAmounts } from '~/common/utils/amounts';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db, withTransaction } from '~/server/db';
import type { Product, Update, VariantAmount } from '~/types/data';

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
                    years: 1,
                    missing: 1,
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

export async function addProduct(group: string, name: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db()).collection('products').insertOne({ group, name }).then(hasEffect);
}

export const cleanupRecycled = ({ recycled, ...v }: VariantAmount): VariantAmount =>
    recycled != null ? { ...v, recycled } : v;

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
        const product = await col.findOne(filter, { projection: { years: 1, missing: 1, updates: 1 }, session });
        const amounts =
            (year ? product?.years?.find((y) => y.year === year)?.amounts : getCombinedAmounts(product?.years)) ?? [];
        const updates = changes.reduce(addVariantAmount, amounts).filter(hasAmount).map(cleanupRecycled);

        // save all change types (consumed=recycled:false, recycled=recycled:true, updated=no recycled field)
        const historyAmounts = changes.map(cleanupRecycled);
        const newEntry = { time: Date.now(), user, ...(comment ? { comment } : {}), years: [{ year, amounts: historyAmounts }] };
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
        const product = await col.findOne(filter, { projection: { years: 1, updates: 1, undates: 1 }, session });

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
        const product = await col.findOne(filter, { projection: { years: 1, updates: 1, undates: 1 }, session });

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
