import { isDevMode } from '~/common/utils/dev';
import { cleanupRecycled, hasAmount } from '~/server/data/products';
import { hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';
import type { ProductUpdateHistoryItem, VariantAmount } from '~/types/data';

type ProductsHistoryDebug = {
    year: number;
    pipelineRows: number;
    returnedRows: number;
    emptyPipelineRows: number;
    emptyReturnedRows: number;
    emptySamples: Array<{
        group: string;
        name: string;
        time: unknown;
        user?: string;
        year: number;
        amounts: unknown;
    }>;
};

export async function getProductsHistory(
    year: number
): Promise<{ history: readonly ProductUpdateHistoryItem[]; debug?: ProductsHistoryDebug }> {
    const database = await db();
    const data = await database
        .collection('products')
        .aggregate<{
            group: string;
            name: string;
            time: number;
            user?: string;
            year: number;
            amounts: VariantAmount[];
        }>([
            // Only documents with updates
            { $match: { updates: { $exists: true, $ne: [] } } },
            { $unwind: '$updates' },
            // Filter by update time *as date* (works for number/date/string) and calendar year boundaries
            {
                $match: {
                    $expr: {
                        $and: [
                            {
                                $gte: [{ $toDate: '$updates.time' }, { $dateFromParts: { year, month: 1, day: 1 } }],
                            },
                            {
                                $lt: [
                                    { $toDate: '$updates.time' },
                                    { $dateFromParts: { year: year + 1, month: 1, day: 1 } },
                                ],
                            },
                        ],
                    },
                },
            },
            // Normalize and filter out "empty changes" at the update level:
            // - ensure years is an array
            // - ensure amounts is an array
            // - drop amounts without variant or with amount=0
            // - drop year entries with no remaining amounts
            // - drop updates that have no remaining year entries
            {
                $set: {
                    'updates.years': {
                        $filter: {
                            input: {
                                $map: {
                                    input: { $cond: [{ $isArray: '$updates.years' }, '$updates.years', []] },
                                    as: 'y',
                                    in: {
                                        $mergeObjects: [
                                            '$$y',
                                            {
                                                amounts: {
                                                    $filter: {
                                                        input: {
                                                            $cond: [{ $isArray: '$$y.amounts' }, '$$y.amounts', []],
                                                        },
                                                        as: 'a',
                                                        cond: {
                                                            $and: [
                                                                { $ne: [{ $ifNull: ['$$a.variant', ''] }, ''] },
                                                                { $ne: [{ $ifNull: ['$$a.amount', 0] }, 0] },
                                                            ],
                                                        },
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            as: 'y',
                            cond: { $gt: [{ $size: '$$y.amounts' }, 0] },
                        },
                    },
                },
            },
            {
                $match: {
                    $expr: { $gt: [{ $size: '$updates.years' }, 0] },
                },
            },
            { $unwind: '$updates.years' },
            {
                $project: {
                    _id: 0,
                    group: 1,
                    name: 1,
                    // keep raw time value (whatever stored) for ID + client rendering
                    time: '$updates.time',
                    user: '$updates.user',
                    year: { $ifNull: ['$updates.years.year', 0] },
                    // amounts already normalized/filtered above
                    amounts: '$updates.years.amounts',
                },
            },
            // Safety: never emit entries with empty amounts
            {
                $match: {
                    $expr: { $gt: [{ $size: { $ifNull: ['$amounts', []] } }, 0] },
                },
            },
            { $sort: { time: -1, group: 1, name: 1, year: -1 } },
        ])
        .toArray();

    const history: ProductUpdateHistoryItem[] = data
        // Final safety net in case Mongo data is malformed
        .filter((d) => Array.isArray(d.amounts) && d.amounts.length > 0)
        .map((d) => ({
            id: `${d.group}:${d.name}:${d.time}:${d.year}`,
            group: d.group,
            name: d.name,
            time: d.time,
            user: d.user,
            year: d.year,
            amounts: d.amounts ?? [],
        }));

    if (isDevMode()) {
        const emptyPipeline = data.filter((d) => !Array.isArray(d.amounts) || d.amounts.length === 0);
        const emptyReturned = history.filter((h) => !Array.isArray(h.amounts) || h.amounts.length === 0);
        return {
            history,
            debug: {
                year,
                pipelineRows: data.length,
                returnedRows: history.length,
                emptyPipelineRows: emptyPipeline.length,
                emptyReturnedRows: emptyReturned.length,
                emptySamples: emptyPipeline.slice(0, 10).map((d) => ({
                    group: d.group,
                    name: d.name,
                    time: d.time as unknown,
                    user: d.user,
                    year: d.year,
                    amounts: d.amounts as unknown,
                })),
            },
        };
    }

    return { history };
}

export async function deleteProductsHistoryEntry(
    group: string,
    name: string,
    time: number,
    year: number
): Promise<boolean> {
    if (!group || !name || !time || !year) {
        return false;
    }
    return (await db())
        .collection('products')
        .updateOne({ group, name }, { $pull: { updates: { time, 'years.year': year } } })
        .then(hasEffect);
}

export async function updateProductsHistoryEntry(
    group: string,
    name: string,
    time: number,
    year: number,
    amounts: readonly VariantAmount[],
    user?: string
): Promise<boolean> {
    if (!group || !name || !time || !year) {
        return false;
    }

    const updates = (amounts ?? [])
        .filter((a) => !!a?.variant)
        .map((a) => ({ variant: a.variant, amount: Number(a.amount), recycled: !!a.recycled }))
        .filter(hasAmount)
        .map(cleanupRecycled);

    if (!updates.length) {
        return false;
    }

    const $setUser = typeof user === 'string' ? { user } : {};

    const pipeline = [
        {
            $set: {
                updates: {
                    $map: {
                        input: '$updates',
                        as: 'u',
                        in: {
                            $cond: [
                                {
                                    $and: [{ $eq: ['$$u.time', time] }, { $in: [year, '$$u.years.year'] }],
                                },
                                {
                                    $mergeObjects: [
                                        '$$u',
                                        $setUser,
                                        {
                                            years: {
                                                $map: {
                                                    input: '$$u.years',
                                                    as: 'y',
                                                    in: {
                                                        $cond: [
                                                            { $eq: ['$$y.year', year] },
                                                            { $mergeObjects: ['$$y', { amounts: updates }] },
                                                            '$$y',
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                                '$$u',
                            ],
                        },
                    },
                },
            },
        },
    ];

    return (await db())
        .collection('products')
        .updateOne({ group, name, 'updates.time': time, 'updates.years.year': year }, pipeline)
        .then(hasEffect);
}
