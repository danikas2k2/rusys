import { cleanupRecycled, hasAmount } from '~/server/data/products';
import { hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';
import type { ProductUpdateHistoryItem, VariantAmount } from '~/types/data';

export async function getProductsHistory(year: number): Promise<{ history: readonly ProductUpdateHistoryItem[] }> {
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
            { $unwind: '$updates.years' },
            // Drop meaningless history entries (no recorded amounts)
            {
                $match: {
                    $expr: {
                        $gt: [{ $size: { $ifNull: ['$updates.years.amounts', []] } }, 0],
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    group: 1,
                    name: 1,
                    // keep raw time value (whatever stored) for ID + client rendering
                    time: '$updates.time',
                    user: '$updates.user',
                    year: '$updates.years.year',
                    amounts: '$updates.years.amounts',
                },
            },
            { $sort: { time: -1, group: 1, name: 1, year: -1 } },
        ])
        .toArray();

    const history: ProductUpdateHistoryItem[] = data.map((d) => ({
        id: `${d.group}:${d.name}:${d.time}:${d.year}`,
        group: d.group,
        name: d.name,
        time: d.time,
        user: d.user,
        year: d.year,
        amounts: d.amounts ?? [],
    }));

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
