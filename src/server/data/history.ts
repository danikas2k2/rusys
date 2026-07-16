import type { Document, WithId } from 'mongodb';

import { db } from '~/server/db';
import type { History } from '~/types/data';

export const HISTORY_SESSION_GAP_MS = 15 * 60 * 1000;

const SUMMARY_START_MONTH = 9; // September — matches summary year grouping

async function getSessionsFromField(
    field: 'updates' | 'undates',
    year: number,
    month: number = 1,
    group?: string,
    name?: string,
    byDate = false
): Promise<History[]> {
    const f = field;
    const productFilter: Document =
        group && name ? { [f]: { $exists: true, $ne: [] }, group, name } : { [f]: { $exists: true, $ne: [] } };

    const gapMs = HISTORY_SESSION_GAP_MS;

    const yearFilter: Document =
        group && name /*&& !byDate*/
            ? {
                  $or: [
                      { [`${f}.years`]: { $elemMatch: { year } } },
                      { [`${f}.years`]: { $elemMatch: { year: year - 2000 } } },
                  ],
              }
            : {
                  $expr: {
                      $and: [
                          {
                              $gte: [{ $toDate: `$${f}.time` }, { $dateFromParts: { year, month, day: 1 } }],
                          },
                          {
                              $lt: [{ $toDate: `$${f}.time` }, { $dateFromParts: { year: year + 1, month, day: 1 } }],
                          },
                      ],
                  },
              };

    return (await db())
        .collection('products')
        .aggregate<WithId<History>>([
            { $match: productFilter },
            { $unwind: `$${f}` },
            { $match: yearFilter },
            {
                $set: {
                    [`${f}.years`]: {
                        $filter: {
                            input: {
                                $map: {
                                    input: { $cond: [{ $isArray: `$${f}.years` }, `$${f}.years`, []] },
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
                    $expr: { $gt: [{ $size: `$${f}.years` }, 0] },
                },
            },
            { $unwind: `$${f}.years` },
            {
                $project: {
                    _id: 0,
                    group: 1,
                    name: 1,
                    time: `$${f}.time`,
                    timeMs: { $toLong: { $toDate: `$${f}.time` } },
                    user: `$${f}.user`,
                    comment: `$${f}.comment`,
                    userKey: { $toLower: { $ifNull: [`$${f}.user`, ''] } },
                    year: { $ifNull: [`$${f}.years.year`, 0] },
                    amounts: `$${f}.years.amounts`,
                },
            },
            {
                $match: {
                    $expr: { $gt: [{ $size: { $ifNull: ['$amounts', []] } }, 0] },
                },
            },
            {
                $setWindowFields: {
                    partitionBy: '$userKey',
                    sortBy: { timeMs: 1, group: 1, name: 1, year: 1 },
                    output: {
                        prevTimeMs: { $shift: { output: '$timeMs', by: -1, default: null } },
                    },
                },
            },
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
            {
                $set: {
                    sessionId: { $concat: ['$userKey', ':', { $toString: '$sessionStartTimeMs' }] },
                    id: {
                        $concat: ['$group', ':', '$name', ':', { $toString: '$time' }, ':', { $toString: '$year' }],
                    },
                },
            },
            { $sort: { timeMs: -1, group: 1, name: 1, year: -1 } },
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

export async function getHistorySessions(year: number, group?: string, name?: string): Promise<History[]> {
    return getSessionsFromField('updates', year, 1, group, name);
}

export async function getUndateSessions(year: number, group?: string, name?: string): Promise<History[]> {
    return getSessionsFromField('undates', year, 1, group, name);
}

export async function getHistorySessionsByDate(year: number, group: string, name: string): Promise<History[]> {
    return getSessionsFromField('updates', year, SUMMARY_START_MONTH, group, name, true);
}

export async function getUndateSessionsByDate(year: number, group: string, name: string): Promise<History[]> {
    return getSessionsFromField('undates', year, SUMMARY_START_MONTH, group, name, true);
}
