import type { Document, WithId } from 'mongodb';

import { cleanupRecycled } from '~/server/data/products';
import { hasEffect } from '~/server/data/utils';
import { db, withTransaction } from '~/server/db';
import type { History, Update, VariantAmount, YearAmounts } from '~/types/data';

export async function getHistory(year: number): Promise<{ history: readonly History[] }> {
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

    const history: History[] = data
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

    return { history };
}

export const HISTORY_SESSION_GAP_MS = 15 * 60 * 1000;

export async function getHistorySessions(year: number, gapMs: number = HISTORY_SESSION_GAP_MS): Promise<History[]> {
    return (await db())
        .collection('products')
        .aggregate<WithId<History>>([
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
                    timeMs: { $toLong: { $toDate: '$updates.time' } },
                    user: '$updates.user',
                    userKey: { $toLower: { $ifNull: ['$updates.user', ''] } },
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

            // Window calc 1: previous time per user (ascending)
            {
                $setWindowFields: {
                    partitionBy: '$userKey',
                    sortBy: { timeMs: 1, group: 1, name: 1, year: 1 },
                    output: {
                        prevTimeMs: { $shift: { output: '$timeMs', by: -1, default: null } },
                    },
                },
            },

            // Mark session boundaries (same rule as client: new session if gap > gapMs)
            {
                $set: {
                    newSession: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ['$prevTimeMs', null] },
                                    { $gt: [{ $subtract: ['$timeMs', '$prevTimeMs'] }, gapMs] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },

            // Window calc 2: running session index per user
            {
                $setWindowFields: {
                    partitionBy: '$userKey',
                    sortBy: { timeMs: 1, group: 1, name: 1, year: 1 },
                    output: {
                        sessionIndex: {
                            $sum: '$newSession',
                            window: { documents: ['unbounded', 'current'] },
                        },
                    },
                },
            },

            // Window calc 3: session start time per (user, sessionIndex)
            {
                $setWindowFields: {
                    partitionBy: { userKey: '$userKey', sessionIndex: '$sessionIndex' },
                    sortBy: { timeMs: 1 },
                    output: {
                        sessionStartTimeMs: {
                            $min: '$timeMs',
                            window: { documents: ['unbounded', 'unbounded'] },
                        },
                    },
                },
            },

            // Produce sessionId and id fields
            {
                $set: {
                    sessionId: { $concat: ['$userKey', ':', { $toString: '$sessionStartTimeMs' }] },
                    id: {
                        $concat: ['$group', ':', '$name', ':', { $toString: '$time' }, ':', { $toString: '$year' }],
                    },
                },
            },

            // Final sort similar to getHistory (use normalized time for safety)
            { $sort: { timeMs: -1, group: 1, name: 1, year: -1 } },

            // Drop helper fields
            {
                $project: {
                    timeMs: 0,
                    userKey: 0,
                    prevTimeMs: 0,
                    newSession: 0,
                    sessionIndex: 0,
                    sessionStartTimeMs: 0,
                },
            },
        ])
        .toArray();
}

export async function deleteHistory(group: string, name: string, time: number, year: number): Promise<boolean> {
    if (!group || !name || !time || !year) {
        return false;
    }
    return (await db())
        .collection('products')
        .updateOne({ group, name }, { $pull: { updates: { time, 'years.year': year } } })
        .then(hasEffect);
}

export async function updateHistory(
    group: string,
    name: string,
    time: number,
    year: number,
    amounts?: readonly VariantAmount[],
    user?: string
): Promise<boolean> {
    if (!group || !name || !time || !year) {
        return false;
    }

    const updates = (amounts ?? [])
        .filter((a) => !!a?.variant)
        .map((a) => ({ variant: a.variant, amount: Number(a.amount), recycled: !!a.recycled }))
        .filter((a) => Number.isFinite(a.amount) && a.amount !== 0)
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

export async function moveHistory(
    group: string,
    name: string,
    time: number,
    year: number,
    newGroup: string,
    newName: string,
    newYear: number
): Promise<boolean> {
    if (!group || !name || !time || !year || !newGroup || !newName || !newYear) {
        return false;
    }

    if (group === newGroup && name === newName && year === newYear) {
        return true;
    }

    return withTransaction(async (session) => {
        const database = await db();
        const col = database.collection<Document>('products');

        const src = await col.findOne({ group, name }, { projection: { updates: 1 }, session });
        const rawUpdates = (src as unknown as { updates?: unknown })?.updates;
        if (!Array.isArray(rawUpdates) || !rawUpdates.length) {
            return false;
        }
        const updates = rawUpdates as unknown as readonly Update[];

        const update = updates.find((u) => u.time === time);
        const years: readonly YearAmounts[] = update?.years ?? [];
        const y = years.find((yy) => yy.year === year);
        const amounts: readonly VariantAmount[] = y?.amounts ?? [];
        if (!amounts.length) {
            return false;
        }
        const user = update?.user;

        // 1) Remove from source (remove the year entry; remove update if no years left)
        const removePipeline: Document[] = [
            {
                $set: {
                    updates: {
                        $filter: {
                            input: {
                                $map: {
                                    input: { $cond: [{ $isArray: '$updates' }, '$updates', []] },
                                    as: 'u',
                                    in: {
                                        $cond: [
                                            { $eq: ['$$u.time', time] },
                                            {
                                                $mergeObjects: [
                                                    '$$u',
                                                    {
                                                        years: {
                                                            $filter: {
                                                                input: {
                                                                    $cond: [{ $isArray: '$$u.years' }, '$$u.years', []],
                                                                },
                                                                as: 'y',
                                                                cond: { $ne: ['$$y.year', year] },
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
                            as: 'u',
                            cond: { $gt: [{ $size: { $ifNull: ['$$u.years', []] } }, 0] },
                        },
                    },
                },
            },
        ];

        if (
            !(await col.updateOne({ group, name, 'updates.time': time }, removePipeline, { session }).then(hasEffect))
        ) {
            return false;
        }

        // 2) Upsert into target product updates
        const target = await col.findOne({ group: newGroup, name: newName }, { projection: { group: 1 }, session });
        if (!target) {
            return false;
        }

        const newUpdate: Update = { time, user, years: [{ year: newYear, amounts }] };

        const upsertPipeline: Document[] = [
            {
                $set: {
                    updates: {
                        $let: {
                            vars: { upd: { $cond: [{ $isArray: '$updates' }, '$updates', []] } },
                            in: {
                                $cond: [
                                    {
                                        $in: [
                                            time,
                                            {
                                                $map: {
                                                    input: '$$upd',
                                                    as: 'u',
                                                    in: '$$u.time',
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        $map: {
                                            input: '$$upd',
                                            as: 'u',
                                            in: {
                                                $cond: [
                                                    { $eq: ['$$u.time', time] },
                                                    {
                                                        $mergeObjects: [
                                                            '$$u',
                                                            user ? { user } : {},
                                                            {
                                                                years: {
                                                                    $let: {
                                                                        vars: {
                                                                            yrs: {
                                                                                $cond: [
                                                                                    { $isArray: '$$u.years' },
                                                                                    '$$u.years',
                                                                                    [],
                                                                                ],
                                                                            },
                                                                        },
                                                                        in: {
                                                                            $cond: [
                                                                                { $in: [newYear, '$$yrs.year'] },
                                                                                {
                                                                                    $map: {
                                                                                        input: '$$yrs',
                                                                                        as: 'y',
                                                                                        in: {
                                                                                            $cond: [
                                                                                                {
                                                                                                    $eq: [
                                                                                                        '$$y.year',
                                                                                                        newYear,
                                                                                                    ],
                                                                                                },
                                                                                                {
                                                                                                    $mergeObjects: [
                                                                                                        '$$y',
                                                                                                        { amounts },
                                                                                                    ],
                                                                                                },
                                                                                                '$$y',
                                                                                            ],
                                                                                        },
                                                                                    },
                                                                                },
                                                                                {
                                                                                    $concatArrays: [
                                                                                        '$$yrs',
                                                                                        [{ year: newYear, amounts }],
                                                                                    ],
                                                                                },
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
                                    { $concatArrays: ['$$upd', [newUpdate]] },
                                ],
                            },
                        },
                    },
                },
            },
        ];

        return col.updateOne({ group: newGroup, name: newName }, upsertPipeline, { session }).then(hasEffect);
    });
}
