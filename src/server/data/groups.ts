import type { ClientSession } from 'mongodb';

import type { Group } from '~/common/data';
import { imageFieldUpdate, resolveImage } from '~/server/data/resolveImage';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';

export const getGroups = async (): Promise<readonly Group[]> =>
    (await db())
        .collection<Group>('groups')
        .find({ archivedAt: { $exists: false } }, { projection: { _id: 0 }, sort: { order: 1, group: 1 } })
        .toArray();

export const getGroup = async (group: string): Promise<Readonly<Group> | null> =>
    (await db())
        .collection<Group>('groups')
        .findOne({ group, archivedAt: { $exists: false } }, { projection: { _id: 0 } });

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
