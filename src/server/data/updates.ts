import { getGroups } from '~/server/data/groups';
import { getVariants } from '~/server/data/variants';
import { getYears } from '~/server/data/years';
import { db } from '~/server/db';
import type { Group, Summary, Variant } from '~/types/data';

const MAX_YEARS = 3;
const START_MONTH = 9; // September

export const getSummary = async (years: number[] = getYears()): Promise<readonly Summary[]> =>
    await (
        await db()
    )
        .collection('products')
        .aggregate<Summary>([
            { $unwind: '$updates' },
            {
                $match: {
                    $expr: {
                        $gte: [
                            { $toDate: '$updates.time' },
                            { $dateFromParts: { year: 2000 + Math.min(...years), month: START_MONTH, day: 1 } },
                        ],
                    },
                },
            },

            { $unwind: '$updates.years' },
            { $unwind: '$updates.years.amounts' },
            { $match: { 'updates.years.amounts.amount': { $lt: 0 } } },

            {
                $lookup: {
                    from: 'variants',
                    let: { group: '$group', variant: '$updates.years.amounts.variant' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ['$group', '$$group'] }, { $eq: ['$variant', '$$variant'] }],
                                },
                            },
                        },
                        { $project: { _id: 0, order: 1 } },
                    ],
                    as: 'variantMeta',
                },
            },
            { $set: { variantOrder: { $arrayElemAt: ['$variantMeta.order', 0] } } },

            {
                $group: {
                    _id: {
                        group: '$group',
                        name: '$name',
                        year: {
                            $subtract: [
                                { $subtract: [{ $year: { $toDate: '$updates.time' } }, 2000] },
                                { $cond: [{ $lt: [{ $month: { $toDate: '$updates.time' } }, START_MONTH] }, 1, 0] },
                            ],
                        },
                        variant: '$updates.years.amounts.variant',
                    },
                    amount: { $sum: '$updates.years.amounts.amount' },
                    recycled: { $max: '$updates.years.amounts.recycled' },
                    variantOrder: { $first: '$variantOrder' },
                },
            },

            {
                $group: {
                    _id: { group: '$_id.group', name: '$_id.name', year: '$_id.year' },
                    amounts: {
                        $push: {
                            variant: '$_id.variant',
                            amount: { $multiply: [-1, '$amount'] },
                            recycled: {
                                $cond: [{ $ne: ['$recycled', null] }, '$recycled', '$$REMOVE'],
                            },
                            variantOrder: '$variantOrder',
                        },
                    },
                },
            },

            {
                $group: {
                    _id: { group: '$_id.group', name: '$_id.name' },
                    years: { $push: { year: '$_id.year', amounts: '$amounts' } },
                },
            },

            {
                $set: {
                    years: {
                        $sortArray: {
                            input: {
                                $map: {
                                    input: '$years',
                                    as: 'y',
                                    in: {
                                        year: '$$y.year',
                                        amounts: {
                                            $sortArray: {
                                                input: '$$y.amounts',
                                                sortBy: { variantOrder: 1, variant: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            sortBy: { year: -1 },
                        },
                    },
                },
            },
            {
                $set: {
                    years: {
                        $map: {
                            input: '$years',
                            as: 'y',
                            in: {
                                year: '$$y.year',
                                amounts: {
                                    $map: {
                                        input: '$$y.amounts',
                                        as: 'a',
                                        in: {
                                            variant: '$$a.variant',
                                            amount: '$$a.amount',
                                            recycled: '$$a.recycled',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

            {
                $lookup: {
                    from: 'groups',
                    localField: '_id.group',
                    foreignField: 'group',
                    pipeline: [{ $project: { _id: 0, order: 1 } }],
                    as: 'groupMeta',
                },
            },
            { $set: { groupOrder: { $arrayElemAt: ['$groupMeta.order', 0] } } },
            { $sort: { groupOrder: 1, '_id.group': 1, '_id.name': 1 } },
            { $project: { _id: 0, group: '$_id.group', name: '$_id.name', years: 1 } },
        ])
        .toArray();

export const getFullSummary = async (): Promise<
    Readonly<{
        years: readonly number[];
        groups: readonly Group[];
        variants: readonly Variant[];
        summary: readonly Summary[];
    }>
> => {
    const years = getYears(MAX_YEARS);
    return {
        years,
        groups: await getGroups(),
        variants: await getVariants(),
        summary: await getSummary(years),
    };
};
