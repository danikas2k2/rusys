import type { WithId } from 'mongodb';

import { getGroups } from '~/server/data/groups';
import { buildHistoryPipeline } from '~/server/data/history';
import { getVariants } from '~/server/data/variants';
import { getYears } from '~/server/data/years';
import { db } from '~/server/db';
import type { Group, History, Summary, Variant, VariantAmount } from '~/types/data';

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
            {
                $match: {
                    'updates.years.amounts.recycled': { $exists: true },
                    'updates.years.amounts.amount': { $lt: 0 },
                },
            },

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
                        recycled: { $ifNull: ['$updates.years.amounts.recycled', null] },
                    },
                    amount: { $sum: '$updates.years.amounts.amount' },
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
                                $cond: [{ $ne: ['$_id.recycled', null] }, '$_id.recycled', '$$REMOVE'],
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
                                                sortBy: { variantOrder: 1, variant: 1, recycled: -1 },
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

// Aggregates home balances (positive home amounts in product.years) per variant per year.
// These are merged into the main summary so the client gets a single unified list.
const getSummaryHomeBalance = async (): Promise<readonly Summary[]> =>
    await (
        await db()
    )
        .collection('products')
        .aggregate<Summary>([
            { $unwind: '$years' },
            { $unwind: '$years.amounts' },
            {
                $match: {
                    'years.amounts.home': true,
                    'years.amounts.amount': { $gt: 0 },
                },
            },
            {
                $group: {
                    _id: {
                        group: '$group',
                        name: '$name',
                        year: '$years.year',
                        variant: '$years.amounts.variant',
                    },
                    amount: { $sum: '$years.amounts.amount' },
                },
            },
            {
                $group: {
                    _id: { group: '$_id.group', name: '$_id.name', year: '$_id.year' },
                    amounts: {
                        $push: {
                            variant: '$_id.variant',
                            amount: '$amount',
                            home: true,
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
            { $project: { _id: 0, group: '$_id.group', name: '$_id.name', years: 1 } },
        ])
        .toArray();

function mergeSummaries(main: readonly Summary[], home: readonly Summary[]): readonly Summary[] {
    type MutableYearAmounts = { year: number; amounts: VariantAmount[] };
    type MutableSummary = { group: string; name: string; years: MutableYearAmounts[] };

    const result: MutableSummary[] = main.map((s) => ({
        group: s.group,
        name: s.name,
        years: (s.years ?? []).map((y) => ({ year: y.year, amounts: [...y.amounts] as VariantAmount[] })),
    }));
    const index = new Map(result.map((s, i) => [`${s.group}/${s.name}`, i]));
    for (const h of home) {
        const key = `${h.group}/${h.name}`;
        let idx = index.get(key);
        if (idx === undefined) {
            idx = result.length;
            index.set(key, idx);
            result.push({ group: h.group, name: h.name, years: [] });
        }
        const entry = result[idx];
        for (const hy of h.years ?? []) {
            const existingYear = entry.years.find((y) => y.year === hy.year);
            if (existingYear) {
                existingYear.amounts.push(...(hy.amounts as VariantAmount[]));
            } else {
                entry.years.push({ year: hy.year, amounts: [...hy.amounts] as VariantAmount[] });
            }
        }
    }
    return result as unknown as readonly Summary[];
}

export const getFullSummary = async (): Promise<
    Readonly<{
        years: readonly number[];
        groups: readonly Group[];
        variants: readonly Variant[];
        summary: readonly Summary[];
    }>
> => {
    const years = getYears(MAX_YEARS);
    const [main, home] = await Promise.all([getSummary(years), getSummaryHomeBalance()]);
    return {
        years,
        groups: await getGroups(),
        variants: await getVariants(),
        summary: mergeSummaries(main, home),
    };
};

export async function getSummaryHistory(
    group: string,
    name: string,
    year: number,
    field: 'updates' | 'undates'
): Promise<History[]> {
    const y = year + 2000;

    return (await db())
        .collection('products')
        .aggregate<WithId<History>>(
            buildHistoryPipeline(
                group,
                name,
                field,
                {
                    $expr: {
                        $and: [
                            {
                                $gte: [
                                    { $toDate: `$${field}.time` },
                                    { $dateFromParts: { year: y, month: START_MONTH, day: 1 } },
                                ],
                            },
                            {
                                $lt: [
                                    { $toDate: `$${field}.time` },
                                    { $dateFromParts: { year: y + 1, month: START_MONTH, day: 1 } },
                                ],
                            },
                        ],
                    },
                },
                {
                    $and: [{ $ne: [{ $ifNull: ['$$a.recycled', null] }, null] }, { $lt: ['$$a.amount', 0] }],
                }
            )
        )
        .toArray();
}

export async function getSummaryUpdates(group: string, name: string, year: number): Promise<History[]> {
    return getSummaryHistory(group, name, year, 'updates');
}

export async function getSummaryUndates(group: string, name: string, year: number): Promise<History[]> {
    return getSummaryHistory(group, name, year, 'undates');
}
