import { type Details } from '~/common/types';
import { getDetailsCollection, getGroupsCollection, getVariantsCollection } from '~/server/db';

export const getUpdatesCount = async (): Promise<{ count: number } | null> =>
    (await getDetailsCollection())
        .aggregate([
            { $match: { updates: { $exists: true } } },
            { $project: { count: { $size: '$updates' } } },
            { $group: { _id: null, count: { $sum: '$count' } } },
            { $project: { _id: 0, count: 1 } },
        ])
        .next();

export const getLastUpdate = async (): Promise<Details | null> =>
    (await getDetailsCollection())
        .aggregate([
            { $match: { updates: { $exists: true } } },
            { $project: { group: 1, name: 1, updates: { $last: '$updates' } } },
            { $sort: { 'updates.time': -1 } },
            { $project: { _id: 0, group: 1, name: 1, years: '$updates.years' } },
        ])
        .next();

export const getAllGroups = async (projection: object = {}) =>
    (await getGroupsCollection()).find({}, { projection: { _id: 0, ...projection } }).toArray();

export const LESS_VARIANTS_FIELDS = { group: 1, variant: 1, order: 1 };

export const getAllVariants = async (projection: object = {}) =>
    (await getVariantsCollection()).find({}, { projection: { _id: 0, ...projection } }).toArray();

export const NO_UPDATE_FIELDS = {
    updates: 0,
};

export const LESS_UPDATE_FIELDS = {
    'updates.time': 0,
};

export const LESS_DETAILS_FIELDS = {
    missing: 0,
    'years.removing': 0,
    'years.amounts.amount': 0,
    ...LESS_UPDATE_FIELDS,
    'updates.years.amounts.amount': 0,
};

export const getAllDetails = async (projection: object = {}) =>
    (await getDetailsCollection()).find({}, { projection: { _id: 0, ...projection } }).toArray();
