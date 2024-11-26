import { type ClientSession, type Filter, type UpdateFilter } from 'mongodb';
import { type Details, type Group, type Variant, type VariantAmount } from '~/common/types';
import { getGroups } from '~/server/data/groups';
import { addUpdate } from '~/server/data/updates';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { getVariants } from '~/server/data/variants';
import { getYears } from '~/server/data/years';
import { getDetailsCollection, withTransaction } from '~/server/db';

export async function getDetails(years: number[] = getYears()): Promise<Details[]> {
    return (await getDetailsCollection())
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
    return (await getDetailsCollection()).insertOne({ group, name }).then(hasEffect);
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
        await addUpdate(group, name, year, changes, session);

        const filter = { group, name };
        const col = await getDetailsCollection();
        const details = await col.findOne(filter, { projection: { years: 1, missing: 1 }, session });
        const current = details?.years?.find((y) => y.year === year);
        const amounts = current?.amounts ?? [];

        // TODO split to smaller functions
        const updates = changes
            .reduce((acc, { variant, amount }) => {
                const a = acc?.find((v) => v.variant === variant);
                if (a) {
                    a.amount += amount;
                    if (a.amount < 0) {
                        a.amount = 0;
                    }
                    return acc;
                }
                return [...acc, { variant, amount: amount < 0 ? 0 : amount }];
            }, amounts)
            // remove zero amounts
            .filter((a) => a.amount);

        if (updates.length) {
            // TODO split to smaller functions
            const removing =
                !!current?.removing &&
                changes?.some(
                    (a) =>
                        a.amount +
                        (changes?.reduce((acc, c) => {
                            if (c.variant === a.variant) {
                                acc += c.amount;
                            }
                            return acc;
                        }, 0) ?? 0)
                );
            if (removing !== !!current?.removing) {
                await setRemoving(group, name, year, removing, session);
            }

            // TODO split to smaller functions
            const missing = !!details?.missing && changes?.every((a) => a.recycled || a.amount >= 0);
            if (missing !== !!details?.missing) {
                await setMissing(group, name, missing, session);
            }

            return amounts.length
                ? await col
                      .updateOne(
                          { ...filter, 'years.year': year } as UpdateFilter<Details>,
                          { $set: { 'years.$.amounts': updates } },
                          { session }
                      )
                      .then(hasEffect)
                : await col
                      .updateOne(filter, { $push: { years: { year, amounts: updates } } }, { session })
                      .then(hasEffect);
        }

        if (!amounts.length) {
            return false;
        }

        return (
            (await col.updateOne(filter, { $pull: { years: { year } } }, { session }).then(hasEffect)) ||
            (await col // removes empty years
                .updateOne({ ...filter, years: { $size: 0 } }, { $unset: { years: 1, missing: 1 } }, { session })
                .then(hasEffect))
        );
    });
}

export async function renameDetails(
    group: string,
    name: string,
    newName: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !newName) {
        return false;
    }
    return (await getDetailsCollection())
        .updateOne({ group, name }, { $set: { name: newName } }, { session })
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
    return (await getDetailsCollection())
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
    return (await getDetailsCollection())
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
    return (await getDetailsCollection())
        .updateOne({ group, name }, { $set }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function deleteDetails(group: string, name: string, session?: ClientSession): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await getDetailsCollection()).deleteOne({ group, name }, { session }).then(hasEffect);
}

export async function deleteDetailsVariant(group: string, variant: string, session?: ClientSession): Promise<boolean> {
    if (!group || !variant) {
        return false;
    }
    return (await getDetailsCollection())
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
    return (await getDetailsCollection()).deleteMany({ group }, { session }).then(hasEffect);
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
    return (await getDetailsCollection())
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
    return (await getDetailsCollection())
        .updateOne({ group, name }, { [missing ? '$set' : '$unset']: { missing } }, { session })
        .then(hasEffect);
}

export async function getDetailsWithYears(): Promise<{ years: number[]; details: Details[] }> {
    const years = getYears();
    return { years, details: await getDetails(years) };
}

export async function getFullDetails(): Promise<{
    years: ReadonlyArray<number>;
    groups: ReadonlyArray<Group>;
    variants: ReadonlyArray<Variant>;
    details: ReadonlyArray<Details>;
}> {
    const years = getYears();
    return { years, groups: await getGroups(), variants: await getVariants(), details: await getDetails(years) };
}
