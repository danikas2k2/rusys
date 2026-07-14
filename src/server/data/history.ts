import type { Document, WithId } from 'mongodb';

import { db } from '~/server/db';
import type { History } from '~/types/data';

export const HISTORY_SESSION_GAP_MS = 15 * 60 * 1000;

export async function getHistorySessions(
    year: number,
    gapMs: number = HISTORY_SESSION_GAP_MS,
    group?: string,
    name?: string
): Promise<History[]> {
    const productFilter: Document =
        group && name ? { updates: { $exists: true, $ne: [] }, group, name } : { updates: { $exists: true, $ne: [] } };

    const yearFilter: Document =
        group && name
            ? {
                  $or: [
                      { 'updates.years': { $elemMatch: { year } } },
                      { 'updates.years': { $elemMatch: { year: year - 2000 } } },
                  ],
              }
            : {
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
              };

    return (await db())
        .collection('products')
        .aggregate<WithId<History>>([
            // Only documents with updates; narrow to product when group+name provided
            { $match: productFilter },
            { $unwind: '$updates' },

            // For product-specific: filter by product year; for global: filter by update timestamp year
            { $match: yearFilter },

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
