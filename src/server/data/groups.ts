import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';
import { type Group } from '~/types/data';
import { type ClientSession } from 'mongodb';

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

export const getGroups = async (): Promise<ReadonlyArray<Group>> =>
    (await db())
        .collection('groups')
        .find({}, { projection: { _id: 0 }, sort: { order: 1, group: 1 } })
        .toArray();

export async function updateGroup(group: string, order?: number): Promise<boolean> {
    if (!group) {
        return false;
    }
    const col = (await db()).collection('groups');
    return order != null
        ? col.updateOne({ group }, { $set: { order } }, { upsert: true }).then(hasEffect)
        : col
              .aggregate([{ $group: { _id: null, order: { $max: '$order' } } }])
              .next()
              .then((found) => col.insertOne({ group, order: found ? found.order + 1 : 0 }))
              .then(hasEffect)
              .catch(hasDuplicates);
}

export async function reorderGroups(update?: Readonly<Record<string, number>>): Promise<boolean> {
    if (!update) {
        return false;
    }
    const entries = Object.entries(update);
    if (!entries.length) {
        return false;
    }
    return (await db())
        .collection('groups')
        .bulkWrite(
            entries.map(([group, order]) => ({
                updateOne: { filter: { group }, update: { $set: { order } } },
            }))
        )
        .then(hasEffect);
}

export const renameGroup = async (group: string, newGroup: string, session?: ClientSession): Promise<boolean> =>
    group && newGroup && group !== newGroup
        ? (await db())
              .collection('groups')
              .updateOne({ group }, { $set: { group: newGroup } }, { session })
              .then(hasEffect)
              .catch(hasDuplicates)
        : false;

export const deleteGroup = async (group: string, session?: ClientSession): Promise<boolean> =>
    group ? (await db()).collection('groups').deleteOne({ group }, { session }).then(hasEffect) : false;
