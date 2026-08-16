import type { ClientSession } from 'mongodb';

import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';
import type { UpdateVariant, Variant } from '~/types/data';

export async function getVariants(): Promise<readonly Variant[]> {
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
            { $match: { archivedAt: { $exists: false } } },
            {
                $lookup: {
                    from: 'groups',
                    let: { group: '$group' },
                    pipeline: [{ $match: { $expr: { $eq: ['$group', '$$group'] }, archivedAt: { $exists: false } } }],
                    as: 'activeGroup',
                },
            },
            { $match: { 'activeGroup.0': { $exists: true } } },
            {
                $lookup: {
                    from: 'products',
                    let: { group: '$group', variant: '$variant' },
                    pipeline: [{ $match: { $expr: { $and: [matchGroup, matchVariant] } } }],
                    as: 'used',
                },
            },
            { $addFields: { used: { $gt: [{ $size: '$used' }, 0] } } },
            { $project: { _id: 0, activeGroup: 0 } },
            { $sort: { group: 1, order: 1 } },
        ])
        .toArray();
}

export async function updateVariant(group: string, variant: string, update: UpdateVariant): Promise<boolean> {
    if (!group || !variant) {
        return false;
    }
    const col = (await db()).collection<Variant>('variants');
    const found = await col.findOne({ group, variant }, { projection: { _id: 0, order: 1 } });
    const { order, suffix, count, units } = update;
    const $set: UpdateVariant = {};
    if (order != null) {
        $set.order = order;
    }
    const $unset: Omit<UpdateVariant, 'order'> = {};
    (suffix ? $set : $unset).suffix = suffix;
    (count != null ? $set : $unset).count = count;
    (units ? $set : $unset).units = units;
    return found != null
        ? col
              .updateOne({ group, variant }, { $set, $unset: { archivedAt: 1, ...$unset } }, { upsert: true })
              .then(hasEffect)
        : col
              .aggregate([{ $match: { group } }, { $group: { _id: null, order: { $max: '$order' } } }])
              .next()
              .then((next) => col.insertOne({ group, variant, order: next ? next.order + 1 : 0, ...$set }))
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
        const { suffix, count, units } = update;
        (suffix ? $set : $unset).suffix = suffix;
        (count != null ? $set : $unset).count = count;
        (units ? $set : $unset).units = units;
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
        const { order, suffix, count, units } = update;
        if (order != null) {
            copied.order = order;
        }
        if (suffix) {
            copied.suffix = suffix;
        } else {
            delete copied.suffix;
        }
        if (count != null) {
            copied.count = count;
        } else {
            delete copied.count;
        }
        if (units) {
            copied.units = units;
        } else {
            delete copied.units;
        }
    }
    return col.insertOne(copied).then(hasEffect).catch(hasDuplicates);
}

export async function copyVariants(
    group: string,
    newGroup: string,
    variants: readonly string[],
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
        ? (await db())
              .collection('variants')
              .updateOne(
                  { group, variant, archivedAt: { $exists: false } },
                  { $set: { archivedAt: Date.now() } },
                  { session }
              )
              .then(hasEffect)
        : false;

export const deleteVariantsGroup = async (_group: string, _session?: ClientSession): Promise<boolean> =>
    // The archived parent category hides its variants without altering their own state.
    false;

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
