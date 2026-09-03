import type { Group } from '@rusys/common/data';
import type { ClientSession, Collection } from 'mongodb';

import { classifyImage } from '~/server/data/images';
import { imageFieldUpdate, resolveImage } from '~/server/data/resolveImage';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';

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

// Backfills `photo` for an `image` left by a pre-classification version of the app that turns out
// to actually be a photo. An `image` that's genuinely icon-sized is left alone and re-checked -
// cheaply - on every read, since there's no separate marker for "confirmed icon" vs "never checked".
async function migrateGroupImage(col: Collection<Group>, group: Group): Promise<Group> {
    if (!group.image || group.photo) {
        return group;
    }
    const classified = await classifyImage(group.image);
    if (!classified.photo) {
        return group;
    }
    await col.updateOne({ group: group.group }, { $set: { image: classified.image, photo: classified.photo } });
    return { ...group, image: classified.image, photo: classified.photo };
}

export const getGroups = async (): Promise<readonly Group[]> => {
    const col = (await db()).collection<Group>('groups');
    const groups = await col
        .find({ archivedAt: { $exists: false } }, { projection: { _id: 0 }, sort: { order: 1, group: 1 } })
        .toArray();
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
    const resolved = image !== undefined ? await resolveImage(image, existing?.image, existing?.photo) : undefined;
    const fieldUpdate = resolved ? imageFieldUpdate(resolved, 'image', 'photo') : undefined;
    return existing?.order != null
        ? col
              .updateOne(
                  { group },
                  {
                      $set: { annual, review, ...fieldUpdate?.$set },
                      $unset: { archivedAt: 1, ...fieldUpdate?.$unset },
                  }
              )
              .then(hasEffect)
        : col
              .aggregate([{ $group: { _id: null, order: { $max: '$order' } } }])
              .next()
              .then((found) =>
                  col.insertOne({
                      group,
                      order: found ? found.order + 1 : 0,
                      annual,
                      review,
                      ...fieldUpdate?.$set,
                  })
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
    const resolved = image !== undefined ? await resolveImage(image, existing?.image, existing?.photo) : undefined;
    const fieldUpdate = resolved ? imageFieldUpdate(resolved, 'image', 'photo') : undefined;
    return col
        .updateOne(
            { group },
            {
                $set: { group: newGroup, annual, review, ...fieldUpdate?.$set },
                ...(fieldUpdate && Object.keys(fieldUpdate.$unset).length ? { $unset: fieldUpdate.$unset } : {}),
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
    return col
        .updateOne({ group, archivedAt: { $exists: false } }, { $set: { archivedAt: Date.now() } }, { session })
        .then(hasEffect);
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
