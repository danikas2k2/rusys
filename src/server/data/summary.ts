import type { WithId } from 'mongodb';

import { addTypedVariantAmount } from '~/common/utils/amounts';
import { getGroups } from '~/server/data/groups';
import { buildHistoryPipeline } from '~/server/data/history';
import { getVariants } from '~/server/data/variants';
import { getYears } from '~/server/data/years';
import { db } from '~/server/db';
import type { Group, History, Product, Summary, Variant, VariantAmount } from '~/types/data';

const MAX_YEARS = 3;
const START_MONTH = 9; // September

// Corrections that move a consumed line back to discarded are recorded as a fresh update entry
// with a positive amount (see moveConsumedToRecycled) instead of editing old history in place.
// Only entries from this date onward count positive amounts against the consumed total — older
// corrections predate that change and mutated history directly, so there's nothing to add here.
const POSITIVE_CONSUMPTION_CUTOFF = new Date('2026-08-01T00:00:00.000Z');

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
                    $expr: {
                        $or: [
                            { $lt: ['$updates.years.amounts.amount', 0] },
                            { $gte: [{ $toDate: '$updates.time' }, POSITIVE_CONSUMPTION_CUTOFF] },
                        ],
                    },
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

async function getProductMetadata(): Promise<readonly Product[]> {
    const products = await (
        await db()
    )
        .collection<Product>('products')
        .find({}, { projection: { _id: 0, group: 1, name: 1, parent: 1, image: 1, photo: 1 } })
        .toArray();
    return products;
}

function resolveRootName(group: string, name: string, parentByKey: ReadonlyMap<string, string | undefined>): string {
    const visited = new Set<string>();
    let current = name;
    while (!visited.has(current)) {
        visited.add(current);
        const parent = parentByKey.get(`${group}/${current}`);
        if (!parent) {
            return current;
        }
        current = parent;
    }
    // Inconsistent/cyclic data — fall back to the original name rather than looping forever.
    return name;
}

// Folds every product's summary into its topmost ancestor's, so a parent with sub-products
// (e.g. different manufacturers of the same item) shows one combined row instead of one per
// sub-product. Rolled-up amounts keep `recycled` as part of the combine key (addTypedVariantAmount,
// not addVariantAmount) since these are consumed/recycled history totals, not a current balance.
export function rollUpSummaries(
    summaries: readonly Summary[],
    parentByKey: ReadonlyMap<string, string | undefined>
): readonly Summary[] {
    type MutableYearAmounts = { year: number; amounts: VariantAmount[] };
    type MutableSummary = { group: string; name: string; years: MutableYearAmounts[] };

    const result: MutableSummary[] = [];
    const index = new Map<string, number>();

    for (const s of summaries) {
        const rootName = resolveRootName(s.group, s.name, parentByKey);
        const key = `${s.group}/${rootName}`;
        let idx = index.get(key);
        if (idx === undefined) {
            idx = result.length;
            index.set(key, idx);
            result.push({ group: s.group, name: rootName, years: [] });
        }

        const entry = result[idx];
        for (const y of s.years ?? []) {
            const existingYear = entry.years.find((ey) => ey.year === y.year);
            const merged = (y.amounts ?? []).reduce(addTypedVariantAmount, existingYear?.amounts ?? []);
            if (existingYear) {
                existingYear.amounts = merged as VariantAmount[];
            } else {
                entry.years.push({ year: y.year, amounts: merged as VariantAmount[] });
            }
        }
        entry.years.sort((a, b) => b.year - a.year);
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
    const [main, home, products] = await Promise.all([
        getSummary(years),
        getSummaryHomeBalance(),
        getProductMetadata(),
    ]);
    const parentByKey = new Map(products.map((p) => [`${p.group}/${p.name}`, p.parent]));
    const mediaByKey = new Map(
        products.map((p) => [
            `${p.group}/${p.name}`,
            { ...(p.image && { image: p.image }), ...(p.photo && { photo: p.photo }) },
        ])
    );
    const summary = rollUpSummaries(mergeSummaries(main, home), parentByKey).map((item) => {
        const media = mediaByKey.get(`${item.group}/${item.name}`);
        return media ? { ...item, ...media } : item;
    });
    return {
        years,
        groups: await getGroups(),
        variants: await getVariants(),
        summary,
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
                    $and: [
                        { $ne: [{ $ifNull: ['$$a.recycled', null] }, null] },
                        {
                            $or: [
                                { $lt: ['$$a.amount', 0] },
                                { $gte: [{ $toDate: `$${field}.time` }, POSITIVE_CONSUMPTION_CUTOFF] },
                            ],
                        },
                    ],
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
