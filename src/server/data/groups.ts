import type { ClientSession, Collection } from 'mongodb';

import { classifyImage, deleteImageRef } from '~/server/data/images';
import { resolveImage } from '~/server/data/resolveImage';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';
import type { Group } from '~/types/data';

// Backfills a plain-string image left by a pre-classification version of the app, persisting the
// computed ImageRef so future reads skip this recomputation.
async function migrateGroupImage(col: Collection<Group>, group: Group): Promise<Group> {
    if (typeof group.image !== 'string') {
        return group;
    }
    const image = await classifyImage(group.image as unknown as string);
    await col.updateOne({ group: group.group }, { $set: { image } });
    return { ...group, image };
}

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

export const getGroups = async (): Promise<readonly Group[]> => {
    const col = (await db()).collection<Group>('groups');
    const groups = await col.find({}, { projection: { _id: 0 }, sort: { order: 1, group: 1 } }).toArray();
    return Promise.all(groups.map((g) => migrateGroupImage(col, g)));
};

export async function updateGroup(
    group: string,
    annual: boolean = true,
    review: boolean = false,
    image?: string
): Promise<boolean> {
    if (!group) {
        return false;
    }
    const col = (await db()).collection<Group>('groups');
    const existing = await col.findOne({ group });
    const resolved = image !== undefined ? await resolveImage(image, existing?.image) : undefined;
    const imageUpdate = resolved ? { image: resolved } : {};
    const unsetImage = image !== undefined && !resolved;
    return existing?.order != null
        ? col
              .updateOne(
                  { group },
                  { $set: { annual, review, ...imageUpdate }, ...(unsetImage ? { $unset: { image: 1 } } : {}) }
              )
              .then(hasEffect)
        : col
              .aggregate([{ $group: { _id: null, order: { $max: '$order' } } }])
              .next()
              .then((found) =>
                  col.insertOne({ group, order: found ? found.order + 1 : 0, annual, review, ...imageUpdate })
              )
              .then(hasEffect)
              .catch(hasDuplicates);
}

export async function renameGroup(
    group: string,
    newGroup: string,
    annual: boolean = true,
    review: boolean = false,
    image?: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !newGroup || group === newGroup) {
        return false;
    }
    const col = (await db()).collection<Group>('groups');
    const existing = await col.findOne({ group }, { session });
    const resolved = image !== undefined ? await resolveImage(image, existing?.image) : undefined;
    const imageUpdate = resolved ? { image: resolved } : {};
    const unsetImage = image !== undefined && !resolved;
    return col
        .updateOne(
            { group },
            {
                $set: { group: newGroup, annual, review, ...imageUpdate },
                ...(unsetImage ? { $unset: { image: 1 } } : {}),
            },
            { session }
        )
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function deleteGroup(group: string, session?: ClientSession): Promise<boolean> {
    if (!group) {
        return false;
    }
    const col = (await db()).collection<Group>('groups');
    const existing = await col.findOne({ group }, { session });
    const deleted = await col.deleteOne({ group }, { session }).then(hasEffect);
    if (deleted) {
        await deleteImageRef(existing?.image);
    }
    return deleted;
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
