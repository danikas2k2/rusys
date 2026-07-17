import type { Document } from 'mongodb';

export function buildHistoryPipeline(
    group: string,
    name: string,
    field: 'updates' | 'undates',
    yearFilter: Document,
    amountFilter: Document = { $ne: [{ $ifNull: ['$$a.amount', 0] }, 0] }
): Document[] {
    return [
        { $match: { [field]: { $exists: true, $ne: [] }, group, name } },
        { $unwind: `$${field}` },
        { $match: yearFilter },
        {
            $set: {
                [`${field}.years`]: {
                    $filter: {
                        input: {
                            $map: {
                                input: { $cond: [{ $isArray: `$${field}.years` }, `$${field}.years`, []] },
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
                                                            amountFilter,
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
        { $match: { $expr: { $gt: [{ $size: `$${field}.years` }, 0] } } },
        { $unwind: `$${field}.years` },
        {
            $project: {
                _id: 0,
                group: 1,
                name: 1,
                time: `$${field}.time`,
                timeMs: { $toLong: { $toDate: `$${field}.time` } },
                user: `$${field}.user`,
                comment: `$${field}.comment`,
                userKey: { $toLower: { $ifNull: [`$${field}.user`, ''] } },
                year: { $ifNull: [`$${field}.years.year`, 0] },
                amounts: `$${field}.years.amounts`,
            },
        },
        { $match: { $expr: { $gt: [{ $size: { $ifNull: ['$amounts', []] } }, 0] } } },
        {
            $setWindowFields: {
                partitionBy: '$userKey',
                sortBy: { timeMs: 1, group: 1, name: 1, year: 1 },
                output: { prevTimeMs: { $shift: { output: '$timeMs', by: -1, default: null } } },
            },
        },
        {
            $set: {
                newSession: {
                    $cond: [
                        {
                            $or: [
                                { $eq: ['$prevTimeMs', null] },
                                { $gt: [{ $subtract: ['$timeMs', '$prevTimeMs'] }, 900_000 /* 15 min */] },
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
                    sessionIndex: { $sum: '$newSession', window: { documents: ['unbounded', 'current'] } },
                },
            },
        },
        {
            $setWindowFields: {
                partitionBy: { userKey: '$userKey', sessionIndex: '$sessionIndex' },
                sortBy: { timeMs: 1 },
                output: {
                    sessionStartTimeMs: { $min: '$timeMs', window: { documents: ['unbounded', 'unbounded'] } },
                },
            },
        },
        {
            $set: {
                sessionId: { $concat: ['$userKey', ':', { $toString: '$sessionStartTimeMs' }] },
                id: { $concat: ['$group', ':', '$name', ':', { $toString: '$time' }, ':', { $toString: '$year' }] },
            },
        },
        { $sort: { timeMs: -1, group: 1, name: 1, year: -1 } },
        { $project: { timeMs: 0, userKey: 0, prevTimeMs: 0, newSession: 0, sessionIndex: 0, sessionStartTimeMs: 0 } },
    ];
}
