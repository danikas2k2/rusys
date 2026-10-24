import type { ClientSession } from 'mongodb';

import { SchemaError, type Group, type RenameGroup, type UpdateGroup } from '~/schema';
import { getImageFieldUpdate, handleDuplicate, hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';

const rejectDuplicateGroup = (cause: unknown): never =>
    handleDuplicate(cause, () => {
        throw new Error(SchemaError.CategoryAlreadyExists);
    });

export const getGroups = async (session: ClientSession): Promise<readonly Group[]> =>
    (await db())
        .collection<Group>('groups')
        .find({ archivedAt: { $exists: false } }, { projection: { _id: 0 }, sort: { order: 1, group: 1 }, session })
        .toArray();

export const getGroup = async (group: string, session: ClientSession): Promise<Readonly<Group> | null> =>
    (await db())
        .collection<Group>('groups')
        .findOne({ group, archivedAt: { $exists: false } }, { projection: { _id: 0 }, session });

export async function updateGroup({ group, ...update }: UpdateGroup, session: ClientSession): Promise<boolean> {
    if (!group) {
        return false;
    }

    const col = (await db()).collection<Group>('groups');
    const current = await col.findOne({ group }, { session });
    const fieldUpdate = await getImageFieldUpdate(current, update.image);
    const $set = {
        annual: update.annual ?? current?.annual ?? true,
        review: update.review ?? current?.review ?? false,
        ...fieldUpdate?.$set,
    };
    return current?.order != null
        ? col
              .updateOne(
                  { group },
                  {
                      $set,
                      $unset: { archivedAt: 1, ...fieldUpdate?.$unset },
                  },
                  { session }
              )
              .then(hasEffect)
        : col
              .aggregate([{ $group: { _id: null, order: { $max: '$order' } } }], { session })
              .next()
              .then((found) =>
                  col.insertOne(
                      {
                          group,
                          order: found ? found.order + 1 : 0,
                          ...$set,
                      },
                      { session }
                  )
              )
              .then(hasEffect)
              .catch(rejectDuplicateGroup);
}

export async function renameGroup(
    { group, targetGroup, ...update }: RenameGroup,
    session: ClientSession
): Promise<boolean> {
    if (!group || !targetGroup || group === targetGroup) {
        return false;
    }

    const col = (await db()).collection<Group>('groups');
    const current = await col.findOne({ group }, { session });
    const fieldUpdate = await getImageFieldUpdate(current, update.image);
    return col
        .updateOne(
            { group },
            {
                $set: {
                    group: targetGroup,
                    annual: update.annual ?? current?.annual ?? true,
                    review: update.review ?? current?.review ?? false,
                    ...fieldUpdate?.$set,
                },
                ...(fieldUpdate && Object.keys(fieldUpdate.$unset).length ? { $unset: fieldUpdate.$unset } : {}),
            },
            { session }
        )
        .then(hasEffect)
        .catch(rejectDuplicateGroup);
}

export const deleteGroup = async (group: string, session: ClientSession): Promise<boolean> =>
    group
        ? (await db())
              .collection<Group>('groups')
              .updateOne({ group, archivedAt: { $exists: false } }, { $set: { archivedAt: Date.now() } }, { session })
              .then(hasEffect)
        : false;

export async function reorderGroups(
    update: Readonly<Record<string, number>>,
    session: ClientSession
): Promise<boolean> {
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
            })),
            { session }
        )
        .then(hasEffect);
}
