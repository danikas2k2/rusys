import { type ApiAllDetails, type ApiDetailsWithYears } from '~/common/api';
import { type Details, type VariantAmount } from '~/common/types';
import { getGroups } from '~/server/data/groups';
import { addUpdate } from '~/server/data/updates';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { getVariants } from '~/server/data/variants';
import { getYears } from '~/server/data/years';
import { db, withTransaction } from '~/server/db';
import { type ClientSession, type Filter, type UpdateFilter } from 'mongodb';

export async function getDetails(years: ReadonlyArray<number>): Promise<Details[]> {
    return (await db())
        .collection('details')
        .find(
            {
                $or: [
                    { years: { $exists: false } },
                    { years: { $size: 0 } },
                    { 'years.year': { $in: years } } as Filter<Details>,
                ],
            },
            { projection: { _id: 0, updates: 0, removes: 0 }, sort: { group: 1, name: 1, 'years.year': 1 } }
        )
        .toArray();
}

export async function addDetails(group: string, name: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db()).collection('details').insertOne({ group, name }).then(hasEffect);
}

export function addVariantAmount(acc: ReadonlyArray<VariantAmount>, { variant, amount }: VariantAmount): typeof acc {
    const a = acc?.find((v) => v.variant === variant);
    if (a) {
        a.amount += amount;
        return acc;
    }
    return [...acc, { variant, amount }];
}

export async function updateDetails(
    group: string,
    name: string,
    year: number,
    changes: ReadonlyArray<VariantAmount> = []
): Promise<boolean> {
    if (!group || !name || !year || !changes.length) {
        return false;
    }

    return withTransaction(async (session) => {
        // adding changes to updates
        await addUpdate(group, name, year, changes, session);

        const filter = { group, name };
        const col = (await db()).collection<Details>('details');
        const details = await col.findOne(filter, { projection: { years: 1, missing: 1 }, session });

        // removing missing flag if amount decreased but not recycled
        if (details?.missing && changes?.some((a) => !a.recycled && a.amount < 0)) {
            await setMissing(group, name, false, session);
        }

        // calculates amount updates
        const current = details?.years?.find((y) => y.year === year);
        const amounts = current?.amounts ?? [];
        const updates = changes
            // update amounts
            .reduce(addVariantAmount, amounts)
            // remove invalid amounts
            .filter((a) => a.amount > 0);

        // no updates
        if (!updates.length) {
            // and currently no amounts
            if (!amounts.length) {
                // do nothing
                return false;
            }

            return (
                // removes updating year
                (await col.updateOne(filter, { $pull: { years: { year } } }, { session }).then(hasEffect)) ||
                // removes all other empty years
                (await col
                    .updateOne({ ...filter, years: { $size: 0 } }, { $unset: { years: 1, missing: 1 } }, { session })
                    .then(hasEffect))
            );
        }

        // add year if not exists
        if (!amounts.length) {
            return await col
                .updateOne(filter, { $push: { years: { year, amounts: updates } } }, { session })
                .then(hasEffect);
        }

        // updates amounts
        return await col
            .updateOne(
                { ...filter, 'years.year': year } as UpdateFilter<Details>,
                { $set: { 'years.$.amounts': updates } },
                { session }
            )
            .then(hasEffect);
    });
}

export async function renameDetails(group: string, name: string, newName: string): Promise<boolean> {
    if (!group || !name || !newName) {
        return false;
    }
    return (await db())
        .collection('details')
        .updateOne({ group, name }, { $set: { name: newName } })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function renameDetailsVariant(
    group: string,
    variant: string,
    newVariant: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !variant || !newVariant) {
        return false;
    }
    return (await db())
        .collection('details')
        .bulkWrite(
            [
                {
                    updateMany: {
                        filter: { group, 'years.amounts.variant': variant } as UpdateFilter<Details>,
                        arrayFilters: [{ 'variant.variant': variant }],
                        update: { $set: { 'years.$[].amounts.$[variant].variant': newVariant } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years.amounts.variant': variant } as UpdateFilter<Details>,
                        arrayFilters: [{ 'variant.variant': variant }],
                        update: { $set: { 'updates.$[].years.$[].amounts.$[variant].variant': newVariant } },
                    },
                },
            ],
            { session }
        )
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function renameDetailsGroup(group: string, newGroup: string, session?: ClientSession): Promise<boolean> {
    if (!group || !newGroup) {
        return false;
    }
    return (await db())
        .collection('details')
        .updateMany({ group }, { $set: { group: newGroup } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function moveDetails(
    group: string,
    name: string,
    newGroup: string,
    newName?: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !newGroup) {
        return false;
    }
    const $set: { group: string; name?: string } = { group: newGroup };
    if (newName && name !== newName) {
        $set.name = newName;
    }
    return (await db())
        .collection('details')
        .updateOne({ group, name }, { $set }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function deleteDetails(group: string, name: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db()).collection('details').deleteOne({ group, name }).then(hasEffect);
}

export async function deleteDetailsVariant(group: string, variant: string, session?: ClientSession): Promise<boolean> {
    if (!group || !variant) {
        return false;
    }
    return (await db())
        .collection('details')
        .bulkWrite(
            [
                {
                    updateMany: {
                        filter: { group, 'years.amounts.variant': variant } as UpdateFilter<Details>,
                        update: { $pull: { 'years.$[].amounts': { variant } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'years.amounts': { $size: 0 } } as UpdateFilter<Details>,
                        update: { $pull: { years: { amounts: { $size: 0 } } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, years: { $size: 0 } },
                        update: { $unset: { years: 1 } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years.amounts.variant': variant } as UpdateFilter<Details>,
                        update: { $pull: { 'updates.$[].years.$[].amounts': { variant } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years.amounts': { $size: 0 } } as UpdateFilter<Details>,
                        update: { $pull: { 'updates.$[].years': { amounts: { $size: 0 } } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years': { $size: 0 } } as UpdateFilter<Details>,
                        update: { $pull: { updates: { years: { $size: 0 } } } },
                    },
                },
                {
                    updateMany: {
                        filter: { group, updates: { $size: 0 } },
                        update: { $unset: { updates: 1 } },
                    },
                },
            ],
            { session }
        )
        .then(hasEffect);
}

export async function deleteDetailsGroup(group: string, session?: ClientSession): Promise<boolean> {
    if (!group) {
        return false;
    }
    return (await db()).collection('details').deleteMany({ group }, { session }).then(hasEffect);
}

export async function setRemoving(
    group: string,
    name: string,
    year: number,
    removing: boolean,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !year) {
        return false;
    }
    return (await db())
        .collection('details')
        .updateOne(
            { group, name, 'years.year': year } as Filter<Details>,
            { [removing ? '$set' : '$unset']: { 'years.$.removing': removing } },
            { session }
        )
        .then(hasEffect);
}

export async function setMissing(
    group: string,
    name: string,
    missing: boolean,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db())
        .collection('details')
        .updateOne({ group, name }, { [missing ? '$set' : '$unset']: { missing } }, { session })
        .then(hasEffect);
}

export async function getDetailsWithYears(): Promise<ApiDetailsWithYears> {
    const years = getYears();
    return { years, details: await getDetails(years) };
}

export async function getAllDetails(): Promise<ApiAllDetails> {
    const years = getYears();
    return {
        years,
        details: await getDetails(years),
        variants: await getVariants(),
        groups: await getGroups(),
    };
}
