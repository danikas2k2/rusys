import { addVariantAmount, cleanupRecycled, getCombinedAmounts, hasAmount } from '~/common/utils/amounts';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db, withTransaction } from '~/server/db';
import type { Details, VariantAmount } from '~/types/data';
import type { AnyBulkWriteOperation, ClientSession, Filter, UpdateFilter } from 'mongodb';

export async function getDetails(years: ReadonlyArray<number> = []): Promise<Details[]> {
    const col = (await db()).collection('details');
    const filter: Filter<Details> = years.length
        ? {
              $or: [
                  { years: { $exists: false } },
                  { years: { $size: 0 } },
                  { 'years.year': { $in: years } } as Filter<Details>,
              ],
          }
        : {};
    return col
        .find(filter, { projection: { _id: 0, updates: 0, removes: 0 }, sort: { group: 1, name: 1, 'years.year': 1 } })
        .toArray();
}

export async function getDetailsVariants(
    group: string,
    name: string,
    session?: ClientSession
): Promise<ReadonlyArray<string> | undefined> {
    if (!group || !name) {
        return undefined;
    }
    const col = (await db()).collection('details');
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

export async function addDetails(group: string, name: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db()).collection('details').insertOne({ group, name }).then(hasEffect);
}

export async function updateDetails(
    group: string,
    name: string,
    year: number,
    changes: ReadonlyArray<VariantAmount> = [],
    user?: string
): Promise<boolean> {
    if (!group || !name || !changes.length) {
        return false;
    }

    return withTransaction(async (session) => {
        const filter: UpdateFilter<Details> = { group, name };

        const update = {
            time: Date.now(),
            user,
            years: [
                {
                    year,
                    amounts: changes.filter((v) => v.recycled != null).map(cleanupRecycled),
                },
            ],
        };

        // adding changes to updates
        const operations: AnyBulkWriteOperation<Details>[] = [
            {
                updateOne: {
                    filter,
                    update: [
                        {
                            $set: {
                                updates: {
                                    $cond: [
                                        { $isArray: '$updates' },
                                        // add to existing updates
                                        { $concatArrays: ['$updates', [update]] },
                                        // create new updates
                                        [update],
                                    ],
                                },
                            },
                        },
                    ],
                },
            },
        ];

        // calculates amount updates
        const col = (await db()).collection<Details>('details');
        const details = await col.findOne(filter, { projection: { years: 1, missing: 1 }, session });
        const amounts =
            (year ? details?.years?.find((y) => y.year === year)?.amounts : getCombinedAmounts(details?.years)) ?? [];
        const updates = changes
            // update amounts
            .reduce(addVariantAmount, amounts)
            // remove invalid amounts
            .filter(hasAmount)
            // remove recycled if not set
            .map(cleanupRecycled);

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
        if (details?.missing && changes.some((a) => !a.recycled && a.amount < 0)) {
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

export async function renameDetails(group: string, name: string, newName: string): Promise<boolean> {
    if (!group || !name || !newName || name === newName) {
        return false;
    }
    return (await db())
        .collection('details')
        .updateOne({ group, name }, { $set: { name: newName } })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function renameDetailsVariant(
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
        .collection('details')
        .bulkWrite(
            [
                {
                    updateMany: {
                        filter: { group, 'years.amounts.variant': variant } as UpdateFilter<Details>,
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
                        filter: { group, 'updates.years.amounts.variant': variant } as UpdateFilter<Details>,
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

export async function renameDetailsGroup(group: string, newGroup: string, session?: ClientSession): Promise<boolean> {
    if (!group || !newGroup || group === newGroup) {
        return false;
    }
    return (await db())
        .collection('details')
        .updateMany({ group }, { $set: { group: newGroup } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function moveDetails(
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
        .collection('details')
        .updateOne({ group, name }, { $set }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function deleteDetails(group: string, name: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db()).collection('details').deleteOne({ group, name }).then(hasEffect);
}

export async function deleteDetailsVariant(group: string, variant: string, session?: ClientSession): Promise<boolean> {
    if (!group || !variant) {
        return false;
    }
    return (await db())
        .collection('details')
        .bulkWrite(
            [
                {
                    updateMany: {
                        filter: { group, 'years.amounts.variant': variant } as UpdateFilter<Details>,
                        update: { $pull: { 'years.$[].amounts': { variant } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'years.amounts': { $size: 0 } } as UpdateFilter<Details>,
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
                        filter: { group, 'updates.years.amounts.variant': variant } as UpdateFilter<Details>,
                        update: { $pull: { 'updates.$[].years.$[].amounts': { variant } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years.amounts': { $size: 0 } } as UpdateFilter<Details>,
                        update: { $pull: { 'updates.$[].years': { amounts: { $size: 0 } } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years': { $size: 0 } } as UpdateFilter<Details>,
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

export async function deleteDetailsGroup(group: string, session?: ClientSession): Promise<boolean> {
    if (!group) {
        return false;
    }
    return (await db()).collection('details').deleteMany({ group }, { session }).then(hasEffect);
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
        .collection('details')
        .updateOne(
            { group, name, 'years.year': year } as Filter<Details>,
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
        .collection('details')
        .updateOne({ group, name }, { [missing ? '$set' : '$unset']: { missing } }, { session })
        .then(hasEffect);
}
