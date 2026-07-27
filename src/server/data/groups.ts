import type { ClientSession } from 'mongodb';

import { deleteImage, saveImage } from '~/server/data/images';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';
import type { Group } from '~/types/data';

// Resolves the image value to persist: uploads a new file for a freshly-dropped data URL
// (deleting the old one it replaces), or deletes the old file when the image was removed.
async function resolveImage(image: string, previousImage?: string): Promise<string> {
    if (image.startsWith('data:')) {
        const saved = await saveImage(image);
        await deleteImage(previousImage);
        return saved;
    }
    if (image !== previousImage) {
        await deleteImage(previousImage);
    }
    return image;
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

export const getGroups = async (): Promise<readonly Group[]> =>
    (await db())
        .collection('groups')
        .find({}, { projection: { _id: 0 }, sort: { order: 1, group: 1 } })
        .toArray();

export async function updateGroup(
    group: string,
    annual: boolean = true,
    review: boolean = false,
    image?: string
): Promise<boolean> {
    if (!group) {
        return false;
    }
    const col = (await db()).collection('groups');
    const existing = await col.findOne<Group>({ group });
    const imageUpdate = image !== undefined ? { image: await resolveImage(image, existing?.image) } : {};
    return existing?.order != null
        ? col.updateOne({ group }, { $set: { annual, review, ...imageUpdate } }).then(hasEffect)
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
    const col = (await db()).collection('groups');
    const imageUpdate =
        image !== undefined
            ? { image: await resolveImage(image, (await col.findOne<Group>({ group }, { session }))?.image) }
            : {};
    return col
        .updateOne({ group }, { $set: { group: newGroup, annual, review, ...imageUpdate } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function deleteGroup(group: string, session?: ClientSession): Promise<boolean> {
    if (!group) {
        return false;
    }
    const col = (await db()).collection('groups');
    const existing = await col.findOne<Group>({ group }, { session });
    const deleted = await col.deleteOne({ group }, { session }).then(hasEffect);
    if (deleted) {
        await deleteImage(existing?.image);
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
