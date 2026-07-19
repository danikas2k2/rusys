import type { Document } from 'mongodb';

import { DAY_MS, HOUR_MS, QUARTER_HOUR_MS, THREE_MONTHS_MS, WEEK_MS } from '~/common/utils/time';

// Age-based session gap: last week = 15 min, last 3 months = 1 hour, older = 1 day
const sessionGap = {
    $cond: [
        { $lt: [{ $subtract: [{ $toLong: '$$NOW' }, '$timeMs'] }, WEEK_MS] },
        QUARTER_HOUR_MS,
        {
            $cond: [{ $lt: [{ $subtract: [{ $toLong: '$$NOW' }, '$timeMs'] }, THREE_MONTHS_MS] }, HOUR_MS, DAY_MS],
        },
    ],
};

export function buildHistoryPipeline(
    group: string,
    name: string,
    field: 'updates' | 'undates',
    yearFilter: Document,
    amountFilter: Document = { $ne: [{ $ifNull: ['$$a.amount', 0] }, 0] },
    yearEntryFilter?: Document
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
                        cond: yearEntryFilter
                            ? { $and: [{ $gt: [{ $size: '$$y.amounts' }, 0] }, yearEntryFilter] }
                            : { $gt: [{ $size: '$$y.amounts' }, 0] },
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
                                { $gt: [{ $subtract: ['$timeMs', '$prevTimeMs'] }, sessionGap] },
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
            },
        },
        // Merge entries with same (sessionId, year) by summing amounts
        { $unwind: '$amounts' },
        {
            $group: {
                _id: {
                    sessionId: '$sessionId',
                    year: '$year',
                    variant: '$amounts.variant',
                    recycledKey: { $ifNull: ['$amounts.recycled', null] },
                },
                group: { $first: '$group' },
                name: { $first: '$name' },
                timeMs: { $min: '$timeMs' },
                user: { $first: '$user' },
                comment: { $first: '$comment' },
                amount: { $sum: '$amounts.amount' },
            },
        },
        {
            $group: {
                _id: { sessionId: '$_id.sessionId', year: '$_id.year' },
                group: { $first: '$group' },
                name: { $first: '$name' },
                timeMs: { $min: '$timeMs' },
                user: { $first: '$user' },
                comment: { $first: '$comment' },
                amounts: {
                    $push: {
                        $mergeObjects: [
                            { variant: '$_id.variant', amount: '$amount' },
                            { $cond: [{ $ne: ['$_id.recycledKey', null] }, { recycled: '$_id.recycledKey' }, {}] },
                        ],
                    },
                },
            },
        },
        {
            $set: {
                amounts: {
                    $filter: {
                        input: '$amounts',
                        as: 'a',
                        cond: { $ne: ['$$a.amount', 0] },
                    },
                },
            },
        },
        { $match: { $expr: { $gt: [{ $size: '$amounts' }, 0] } } },
        { $sort: { timeMs: -1, group: 1, name: 1, '_id.year': -1 } },
        {
            $project: {
                _id: 0,
                group: 1,
                name: 1,
                time: '$timeMs',
                user: 1,
                comment: 1,
                sessionId: '$_id.sessionId',
                year: '$_id.year',
                amounts: 1,
            },
        },
    ];
}
