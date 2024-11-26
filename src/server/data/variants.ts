import { uniq } from 'lodash';
import { type ClientSession } from 'mongodb';
import { type UpdateVariant, type Variant } from '~/common/types';
import { getDetailsWithYears } from '~/server/data/details';
import { getGroups } from '~/server/data/groups';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { getDetailsCollection, getVariantsCollection } from '~/server/db';

export const getVariants = async (session?: ClientSession): Promise<ReadonlyArray<Variant>> => {
    const matchGroup = { $eq: ['$group', '$$group'] };
    const combineUpdatesYears = {
        input: { $ifNull: ['$updates.years', []] },
        initialValue: [],
        in: { $concatArrays: ['$$value', '$$this'] },
    };
    const matchVariant = {
        $reduce: {
            input: { $concatArrays: [{ $ifNull: ['$years', []] }, { $reduce: combineUpdatesYears }] },
            initialValue: false,
            in: { $or: ['$$value', { $in: ['$$variant', '$$this.amounts.variant'] }] },
        },
    };
    return (await getVariantsCollection())
        .aggregate(
            [
                {
                    $lookup: {
                        from: 'details',
                        let: { group: '$group', variant: '$variant' },
                        pipeline: [{ $match: { $expr: { $and: [matchGroup, matchVariant] } } }],
                        as: 'used',
                    },
                },
                { $addFields: { used: { $gt: [{ $size: '$used' }, 0] } } },
                { $project: { _id: 0 } },
                { $sort: { group: 1, order: 1, name: 1 } },
            ],
            { session }
        )
        .toArray();
};

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
              .then((found) =>
                  col.insertOne({ group, variant, order: found ? found.order + 1 : 0, ...$set }, { session })
              )
              .then(hasEffect);
}

export const renameVariant = async (
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant,
    session?: ClientSession
): Promise<boolean> => {
    const col = await getVariantsCollection();
    const $set: Omit<UpdateVariant, 'order'> = {};
    const $unset: Omit<UpdateVariant, 'order'> = {};
    if (update) {
        const { long, short } = update;
        (long ? $set : $unset).long = long;
        (short ? $set : $unset).short = short;
    }
    return col
        .updateOne({ group, variant }, { $set: { variant: newVariant, ...$set }, $unset }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
};

export const copyVariant = async (
    group: string,
    variant: string,
    newGroup: string,
    newVariant?: string,
    update?: UpdateVariant,
    session?: ClientSession
): Promise<boolean> => {
    if (!newGroup || group === newGroup) {
        return false;
    }
    const col = await getVariantsCollection();
    const $set = ((await col.findOne({ group, variant }, { projection: { _id: 0, group: 0, variant: 0 }, session })) ??
        {}) as UpdateVariant;
    if (update) {
        const { order, long, short } = update;
        if (order != null) {
            $set.order = order;
        }
        if (long) {
            $set.long = long;
        } else {
            delete $set.long;
        }
        if (short) {
            $set.short = short;
        } else {
            delete $set.short;
        }
    }
    return col
        .updateOne({ group: newGroup, variant: newVariant || variant }, { $set }, { upsert: true, session })
        .then(hasEffect)
        .catch(hasDuplicates);
};

export async function copyDetailsVariants(
    group: string,
    name: string,
    newGroup: string,
    session?: ClientSession
): Promise<boolean> {
    if (!newGroup || group === newGroup) {
        return false;
    }
    const detailsCollection = await getDetailsCollection();
    const amountVariants = await detailsCollection.findOne<{ variant?: string[][] }>(
        { group: newGroup, name },
        { projection: { _id: 0, variant: '$years.amounts.variant' }, session }
    );
    const updateVariants = await detailsCollection.findOne<{ variant?: string[][][] }>(
        { group: newGroup, name },
        { projection: { _id: 0, variant: '$updates.years.amounts.variant' }, session }
    );
    const copyingVariants = uniq([
        ...(amountVariants?.variant?.flatMap((v) => v) ?? []),
        ...(updateVariants?.variant?.flatMap((v) => v?.flatMap((w) => w)) ?? []),
    ]);
    if (!copyingVariants.length) {
        return false;
    }

    const variantCollection = await getVariantsCollection();
    const existingVariants = (
        await variantCollection
            .find(
                { group: newGroup, variant: { $in: copyingVariants } },
                { projection: { _id: 0, variant: 1 }, session }
            )
            .toArray()
    ).map((v) => v.variant);

    const missingVariants = copyingVariants.filter((v) => !existingVariants.includes(v));
    if (!missingVariants.length) {
        return false;
    }

    const variants = await variantCollection
        .find({ group, variant: { $in: missingVariants } }, { projection: { _id: 0 }, session })
        .toArray();
    if (!variants.length) {
        return false;
    }

    return variantCollection
        .insertMany(
            variants.map((v) => ({ ...v, group: newGroup })),
            { session }
        )
        .then(hasEffect)
        .catch(hasDuplicates);
}

export const renameVariantsGroup = async (group: string, newGroup: string, session?: ClientSession): Promise<boolean> =>
    (await getVariantsCollection())
        .updateMany({ group }, { $set: { group: newGroup } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);

export const deleteVariant = async (group: string, variant: string, session?: ClientSession): Promise<boolean> =>
    (await getVariantsCollection()).deleteOne({ group, variant }, { session }).then(hasEffect);

export const deleteVariantsGroup = async (group: string, session?: ClientSession): Promise<boolean> =>
    (await getVariantsCollection()).deleteMany({ group }, { session }).then(hasEffect);

export async function reorderVariants(
    group: string,
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
    const col = await getVariantsCollection();
    return col
        .bulkWrite(
            entries.map(([variant, order]) => ({
                updateOne: { filter: { group, variant }, update: { $set: { order } } },
            })),
            { session }
        )
        .then(hasEffect);
}

export async function getDetailsAndVariants() {
    return {
        ...(await getDetailsWithYears()),
        variants: await getVariants(),
    };
}

export const getVariantsResponse = async () => ({ variants: await getVariants() });

export const getFullVariants = async () => ({ groups: await getGroups(), variants: await getVariants() });
