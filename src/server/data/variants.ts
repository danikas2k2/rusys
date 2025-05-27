import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';
import { type UpdateVariant, type Variant } from '~/types/data';
import { type ClientSession } from 'mongodb';

export async function getVariants(): Promise<ReadonlyArray<Variant>> {
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
            in: { $or: ['$$value', { $in: ['$$variant', { $ifNull: ['$$this.amounts.variant', []] }] }] },
        },
    };
    return (await db())
        .collection('variants')
        .aggregate([
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
        ])
        .toArray();
}

export async function updateVariant(group: string, variant: string, update: UpdateVariant): Promise<boolean> {
    if (!group || !variant) {
        return false;
    }
    const col = (await db()).collection<Variant>('variants');
    const { order, long, short } = update;
    const $set: Omit<UpdateVariant, 'order'> = {};
    const $unset: Omit<UpdateVariant, 'order'> = {};
    (long == null ? $unset : $set).long = long;
    (short == null ? $unset : $set).short = short;
    return order != null
        ? col.updateOne({ group, variant }, { $set: { order, ...$set }, $unset }, { upsert: true }).then(hasEffect)
        : col
              .aggregate([{ $match: { group } }, { $group: { _id: null, order: { $max: '$order' } } }])
              .next()
              .then((found) => col.insertOne({ group, variant, order: found ? found.order + 1 : 0, ...$set }))
              .then(hasEffect);
}

export async function renameVariant(
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !variant || !newVariant || variant === newVariant) {
        return false;
    }
    const col = (await db()).collection('variants');
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
}

export const renameVariantsGroup = async (
    group: string,
    newGroup: string,
    session?: ClientSession
): Promise<boolean> =>
    group && newGroup && group !== newGroup
        ? (await db())
              .collection('variants')
              .updateMany({ group }, { $set: { group: newGroup } }, { session })
              .then(hasEffect)
              .catch(hasDuplicates)
        : false;

export async function copyVariant(
    group: string,
    variant: string,
    newGroup: string,
    newVariant?: string,
    update?: UpdateVariant
): Promise<boolean> {
    if (!group || !variant || !newGroup || group === newGroup) {
        return false;
    }
    const col = (await db()).collection('variants');
    const found = await col.findOne({ group, variant }, { projection: { _id: 0, group: 0, variant: 0 } });
    if (!found) {
        return false;
    }
    const copied: Variant = {
        ...found,
        group: newGroup,
        variant: newVariant ?? variant,
    };
    if (update) {
        const { order, long, short } = update;
        if (order != null) {
            copied.order = order;
        }
        if (long) {
            copied.long = long;
        } else {
            delete copied.long;
        }
        if (short) {
            copied.short = short;
        } else {
            delete copied.short;
        }
    }
    return col.insertOne(copied).then(hasEffect).catch(hasDuplicates);
}

export async function copyVariants(
    group: string,
    newGroup: string,
    variants: ReadonlyArray<string>,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !newGroup || group === newGroup || !variants.length) {
        return false;
    }

    const col = (await db()).collection('variants');
    const existingVariants = (
        await col
            .find({ group: newGroup, variant: { $in: variants } }, { projection: { _id: 0, variant: 1 }, session })
            .toArray()
    ).map((v) => v.variant);

    const missingVariants = variants.filter((v) => !existingVariants.includes(v));
    if (!missingVariants.length) {
        return false;
    }

    const copyingVariants = await col
        .find({ group, variant: { $in: missingVariants } }, { projection: { _id: 0 }, session })
        .toArray();
    if (!copyingVariants.length) {
        return false;
    }

    return col
        .insertMany(
            copyingVariants.map((v) => ({ ...v, group: newGroup })),
            { session }
        )
        .then(hasEffect)
        .catch(hasDuplicates);
}

export const deleteVariant = async (group: string, variant: string, session?: ClientSession): Promise<boolean> =>
    group && variant
        ? (await db()).collection('variants').deleteOne({ group, variant }, { session }).then(hasEffect)
        : false;

export const deleteVariantsGroup = async (group: string, session?: ClientSession): Promise<boolean> =>
    group ? (await db()).collection('variants').deleteMany({ group }, { session }).then(hasEffect) : false;

export async function reorderVariants(group: string, update?: Readonly<Record<string, number>>): Promise<boolean> {
    if (!group || !update) {
        return false;
    }
    const entries = Object.entries(update);
    if (!entries.length) {
        return false;
    }
    const col = (await db()).collection('variants');
    return col
        .bulkWrite(
            entries.map(([variant, order]) => ({
                updateOne: { filter: { group, variant }, update: { $set: { order } } },
            }))
        )
        .then(hasEffect);
}
