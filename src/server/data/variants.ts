import { uniq } from 'lodash';
import { type ClientSession } from 'mongodb';
import { type UpdateVariant, type Variant } from '~/common/types';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { getVariantsCollection } from '~/server/db';

export const getVariants = async (session?: ClientSession): Promise<ReadonlyArray<Variant>> =>
    (await getVariantsCollection())
        .find({}, { projection: { _id: 0 }, sort: { group: 1, order: 1, name: 1 }, session })
        .toArray();

export async function setVariants(variants: ReadonlyArray<Variant>, session?: ClientSession): Promise<boolean> {
    const uniqueGroups = uniq(variants.map(({ group }) => group));
    return (await getVariantsCollection())
        .bulkWrite(
            [
                { deleteMany: { filter: { group: { $nin: uniqueGroups } } } },
                ...uniqueGroups.map((group) => ({
                    deleteMany: {
                        filter: {
                            group,
                            variant: {
                                $nin: uniq(variants.filter((v) => v.group === group).map(({ variant }) => variant)),
                            },
                        },
                    },
                })),
                ...variants.map(({ group, variant, order }) => ({
                    deleteOne: { filter: { group, variant, order: { $ne: order } } },
                })),
                ...variants.map(({ group, variant, order }) => ({
                    deleteOne: { filter: { group, order, variant: { $ne: variant } } },
                })),
                ...variants.map(({ group, variant, ...details }) => ({
                    updateOne: { filter: { group, variant }, update: { $set: details }, upsert: true },
                })),
            ],
            { session }
        )
        .then(hasEffect);
}

export async function setGroupVariants(
    group: string,
    variants: Omit<Variant, 'group'>[],
    session?: ClientSession
): Promise<boolean> {
    return (await getVariantsCollection())
        .bulkWrite(
            [
                {
                    deleteMany: {
                        filter: {
                            group,
                            variant: {
                                $nin: uniq(variants.map(({ variant }) => variant)),
                            },
                        },
                    },
                },
                ...variants.map(({ variant, order }) => ({
                    deleteOne: { filter: { group, variant, order: { $ne: order } } },
                })),
                ...variants.map(({ variant, order }) => ({
                    deleteOne: { filter: { group, order, variant: { $ne: variant } } },
                })),
                ...variants.map(({ variant, ...details }) => ({
                    updateOne: { filter: { group, variant }, update: { $set: details }, upsert: true },
                })),
            ],
            { session }
        )
        .then(hasEffect);
}

export async function updateVariant(
    group: string,
    variant: string,
    update: UpdateVariant,
    session?: ClientSession
): Promise<boolean> {
    const col = await getVariantsCollection();
    const { order, long, short } = update;
    const $set: Omit<UpdateVariant, 'order'> = {};
    const $unset: Omit<UpdateVariant, 'order'> = {};
    (long == null ? $unset : $set).long = long;
    (short == null ? $unset : $set).short = short;
    return order != null
        ? col
              .updateOne({ group, variant }, { $set: { order, ...$set }, $unset }, { upsert: true, session })
              .then(hasEffect)
        : col
              .aggregate([{ $match: { group } }, { $group: { _id: null, order: { $max: '$order' } } }], { session })
              .next()
              .then(({ order }) => col.insertOne({ group, variant, order: order + 1, ...$set }, { session }))
              .then(hasEffect);
}

export const renameVariant = async (
    group: string,
    variant: string,
    newVariant: string,
    session?: ClientSession
): Promise<boolean> =>
    (await getVariantsCollection())
        .updateOne({ group, variant }, { $set: { variant: newVariant } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);

export const renameVariantsGroup = async (group: string, newGroup: string, session?: ClientSession): Promise<boolean> =>
    (await getVariantsCollection())
        .updateMany({ group }, { $set: { group: newGroup } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);

export const deleteVariant = async (group: string, variant: string, session?: ClientSession): Promise<boolean> =>
    (await getVariantsCollection()).deleteOne({ group, variant }, { session }).then(hasEffect);

export const deleteVariantsGroup = async (group: string, session?: ClientSession): Promise<boolean> =>
    (await getVariantsCollection()).deleteMany({ group }, { session }).then(hasEffect);
