import { type Details } from '~/common/types';
import { db } from '~/server/db';

export const getUpdatesCount = async (): Promise<{ count: number } | null> =>
    (await db())
        .collection('details')
        .aggregate([
            { $match: { updates: { $exists: true } } },
            { $project: { count: { $size: '$updates' } } },
            { $group: { _id: null, count: { $sum: '$count' } } },
            { $project: { _id: 0, count: 1 } },
        ])
        .next();

export const getLastUpdate = async (): Promise<Details | null> =>
    (await db())
        .collection('details')
        .aggregate([
            { $match: { updates: { $exists: true } } },
            { $project: { group: 1, name: 1, updates: { $last: '$updates' } } },
            { $sort: { 'updates.time': -1 } },
            { $project: { _id: 0, group: 1, name: 1, years: '$updates.years' } },
        ])
        .next();

export const getAllGroups = async (projection: object = {}) =>
    (await db())
        .collection('groups')
        .find({}, { projection: { _id: 0, ...projection } })
        .toArray();

export const getAllVariants = async (projection: object = {}) =>
    (await db())
        .collection('variants')
        .find({}, { projection: { _id: 0, ...projection } })
        .toArray();

export const getAllDetails = async (projection: object = {}) =>
    (await db())
        .collection('details')
        .find({}, { projection: { _id: 0, ...projection } })
        .toArray();
