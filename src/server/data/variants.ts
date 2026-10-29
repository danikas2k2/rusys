import { type ClientSession } from 'mongodb';

import { SchemaError, type CopyVariant, type RenameVariant, type UpdateVariant, type Variant } from '~/schema';
import { handleDuplicate, hasEffect } from '~/server/data/utils';
import { db } from '~/server/db';

const rejectDuplicateVariant = (cause: unknown): never =>
    handleDuplicate(cause, () => {
        throw new Error(SchemaError.VariantAlreadyExists);
    });

export async function getVariants(session: ClientSession): Promise<readonly Variant[]> {
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
        .aggregate<Variant>(
            [
                { $match: { archivedAt: { $exists: false } } },
                {
                    $lookup: {
                        from: 'groups',
                        let: { group: '$group' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$group', '$$group'] }, archivedAt: { $exists: false } } },
                        ],
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
            ],
            { session }
        )
        .toArray();
}

export const getVariant = async (
    group: string,
    variant: string,
    session: ClientSession
): Promise<Readonly<Variant> | null> =>
    (await db())
        .collection<Variant>('variants')
        .findOne({ group, variant, archivedAt: { $exists: false } }, { projection: { _id: 0 }, session });

export async function updateVariant(
    { group, variant, ...update }: UpdateVariant,
    session: ClientSession
): Promise<boolean> {
    if (!group || !variant) {
        return false;
    }
    const col = (await db()).collection<Variant>('variants');
    const current = await col.findOne({ group, variant }, { projection: { _id: 0 }, session });
    const $set: Partial<Variant> = {};
    const $unset: Partial<Record<keyof Variant, 1>> = { archivedAt: 1 };
    if (update.order !== undefined) {
        $set.order = update.order;
    }
    if (update.suffix !== undefined) {
        if (update.suffix) {
            $set.suffix = update.suffix;
        } else {
            $unset.suffix = 1;
        }
    }
    if (update.count !== undefined) {
        $set.count = update.count;
    }
    if (update.units !== undefined) {
        $set.units = update.units;
    }
    if (current) {
        return col.updateOne({ group, variant }, { $set, $unset }, { session }).then(hasEffect);
    }
    const next = await col
        .aggregate([{ $match: { group } }, { $group: { _id: null, order: { $max: '$order' } } }], { session })
        .next();
    return col
        .insertOne({ group, variant, order: next ? next.order + 1 : 0, ...$set }, { session })
        .then(hasEffect)
        .catch(rejectDuplicateVariant);
}

export async function renameVariant(
    { group, variant, targetVariant: newVariant, order, suffix, count, units }: RenameVariant,
    session: ClientSession
): Promise<boolean> {
    if (!group || !variant || !newVariant || variant === newVariant) {
        return false;
    }

    const col = (await db()).collection<Variant>('variants');
    const current = await col.findOne({ group, variant, archivedAt: { $exists: false } }, { session });
    if (!current) {
        throw new Error(SchemaError.NotFound);
    }
    const $set: Partial<Variant> = { variant: newVariant };
    const $unset: Partial<Record<keyof Variant, 1>> = {};
    if (order !== undefined) {
        $set.order = order;
    }
    if (suffix !== undefined) {
        if (suffix) {
            $set.suffix = suffix;
        } else {
            $unset.suffix = 1;
        }
    }
    if (count !== undefined) {
        $set.count = count;
    }
    if (units !== undefined) {
        $set.units = units;
    }
    return col
        .updateOne({ group, variant }, { $set, $unset }, { session })
        .then(hasEffect)
        .catch(rejectDuplicateVariant);
}

export const renameVariantsGroup = async (group: string, newGroup: string, session: ClientSession): Promise<boolean> =>
    group && newGroup && group !== newGroup
        ? (await db())
              .collection('variants')
              .updateMany({ group }, { $set: { group: newGroup } }, { session })
              .then(hasEffect)
              .catch(rejectDuplicateVariant)
        : false;

export async function copyVariant(
    { group, variant, targetGroup, targetVariant, order, suffix, count, units }: CopyVariant,
    session: ClientSession
): Promise<boolean> {
    if (!group || !variant || !targetGroup || group === targetGroup) {
        return false;
    }
    const col = (await db()).collection('variants');
    const found = await col.findOne<Variant>(
        { group, variant },
        { projection: { _id: 0, group: 0, variant: 0 }, session }
    );
    if (!found) {
        return false;
    }
    const copied: Variant = {
        ...found,
        group: targetGroup,
        variant: targetVariant ?? variant,
        order: order ?? found.order,
    };
    if (suffix) {
        copied.suffix = suffix;
    } else if (suffix !== undefined) {
        delete copied.suffix;
    }
    if (count != null) {
        copied.count = count;
    }
    if (units) {
        copied.units = units;
    }
    return col.insertOne(copied, { session }).then(hasEffect).catch(rejectDuplicateVariant);
}

export async function copyVariants(
    group: string,
    newGroup: string,
    variants: readonly string[],
    session: ClientSession
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
        .catch(rejectDuplicateVariant);
}

export const deleteVariant = async (group: string, variant: string, session: ClientSession): Promise<boolean> =>
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

export const deleteVariantsGroup = async (_group: string, _session: ClientSession): Promise<boolean> =>
    // The archived parent category hides its variants without altering their own state.
    false;

export async function reorderVariants(
    group: string,
    update: Readonly<Record<string, number>> | undefined,
    session: ClientSession
): Promise<boolean> {
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
            })),
            { session }
        )
        .then(hasEffect);
}
