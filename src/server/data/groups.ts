import { uniq } from 'lodash';
import { type ClientSession } from 'mongodb';
import { type Group } from '~/common/types';
import { getGroupsCollection } from '~/server/db';
import { hasDuplicates, hasEffect } from './utils';

// Daržovės: 0.5l, 0.75l, 0.25l, 0.01l, x
// Uogienės: 0.5l, 0.75l, 0.25l, 0.01l, x
// Dideli (Agurkai, Kompotai): 3l, 2l, 1.5l, 1l, 0.75l, 0.5l, x
// Šaldyti: 0.25l, 0.5l, maiš.
// Pom.padažai: 0.5l
// Sriubos: 0.5l
// Konservai: vnt.
// Kruopos (Cukrus, Miltai): 1kg, 0.5kg, 0.3kg, 2kg
// Daržovės: vnt.
// Šaldytuve: vnt.
// Priemonės (skalbimo, valymo): ...

export const getGroups = async (session?: ClientSession): Promise<ReadonlyArray<Group>> =>
    (await getGroupsCollection()).find({}, { projection: { _id: 0 }, sort: { order: 1, group: 1 }, session }).toArray();

export const setGroups = async (groups: ReadonlyArray<Group>, session?: ClientSession): Promise<boolean> =>
    (await getGroupsCollection())
        .bulkWrite(
            [
                { deleteMany: { filter: { group: { $nin: uniq(groups.map(({ group }) => group)) } } } },
                ...groups
                    .filter(({ group }) => !!group)
                    .map(({ group, ...details }) => ({
                        updateOne: { filter: { group }, update: { $set: details }, upsert: true },
                    })),
            ],
            { session }
        )
        .then(hasEffect);

export async function updateGroup(group: string, order?: number, session?: ClientSession): Promise<boolean> {
    if (!group) {
        return false;
    }
    const groupCollection = await getGroupsCollection();
    return order != null
        ? groupCollection.updateOne({ group }, { $set: { order } }, { upsert: true, session }).then(hasEffect)
        : groupCollection
              .aggregate([{ $group: { _id: null, order: { $max: '$order' } } }], { session })
              .next()
              .then((found) => groupCollection.insertOne({ group, order: found ? found.order + 1 : 0 }, { session }))
              .then(hasEffect);
}

export async function reorderGroups(
    update?: Readonly<Record<string, number>>,
    session?: ClientSession
): Promise<boolean> {
    if (!update) {
        return false;
    }
    const entries = Object.entries(update);
    if (!entries.length) {
        return false;
    }
    const col = await getGroupsCollection();
    return col
        .bulkWrite(
            entries.map(([group, order]) => ({
                updateOne: { filter: { group }, update: { $set: { order } } },
            })),
            { session }
        )
        .then(hasEffect);
}

export const renameGroup = async (group: string, newGroup: string, session?: ClientSession): Promise<boolean> =>
    group && newGroup
        ? (await getGroupsCollection())
              .updateOne({ group }, { $set: { group: newGroup } }, { session })
              .then(hasEffect)
              .catch(hasDuplicates)
        : false;

export const deleteGroup = async (group: string, session?: ClientSession): Promise<boolean> =>
    group ? (await getGroupsCollection()).deleteOne({ group }, { session }).then(hasEffect) : false;

export const getGroupsResponse = async () => ({ groups: await getGroups() });
