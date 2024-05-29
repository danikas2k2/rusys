import { type ClientSession, type Filter, type UpdateFilter } from 'mongodb';
import { type Details, type RemovingYearAmounts, type VariantAmount } from '~/common/types';
import { addUpdate, addUpdates } from '~/server/data/updates';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
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
            { projection: { _id: 0, updates: 0 }, sort: { group: 1, name: 1, 'years.year': 1 } }
        )
        .toArray();
}

export async function updateDetailsYears(
    group: string,
    name: string,
    years: ReadonlyArray<RemovingYearAmounts> = [],
    withoutHistory = false
): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return withTransaction(async (session) => {
        if (!withoutHistory) {
            await addUpdates(group, name, years, session);
        }
        return (await getDetailsCollection())
            .updateOne(
                { group, name } as UpdateFilter<Details>,
                years?.length ? { $set: { years } } : { $unset: { years: 1, missing: 1 } },
                { upsert: true, session }
            )
            .then(hasEffect);
    });
}

export async function updateDetailsAmounts(
    group: string,
    name: string,
    year: number,
    amounts: ReadonlyArray<VariantAmount> = [],
    withoutHistory = false
): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return withTransaction(async (session) => {
        if (!withoutHistory) {
            if (year) {
                await addUpdate(group, name, year, amounts, session);
            } else {
                await addUpdates(group, name, [], session);
            }
        }
        const col = await getDetailsCollection();
        if (!year) {
            return col
                .updateOne(
                    { group, name } as UpdateFilter<Details>,
                    { $unset: { years: 1, missing: 1 } },
                    { upsert: true, session }
                )
                .then(hasEffect);
        }
        if (amounts?.length) {
            // TODO if upsert may be used here
            return (
                (await col
                    .updateOne(
                        { group, name, 'years.year': year } as UpdateFilter<Details>,
                        { $set: { 'years.$.amounts': amounts } },
                        { session }
                    )
                    .then(hasEffect)) ||
                (await col
                    .updateOne({ group, name }, { $push: { years: { year, amounts } } }, { session })
                    .then(hasEffect))
            );
        }
        return col
            .bulkWrite(
                [
                    // removes year
                    {
                        updateOne: {
                            filter: { group, name },
                            update: { $pull: { years: { year } } },
                            upsert: true,
                        },
                    },
                    // removes empty years
                    {
                        updateOne: {
                            filter: { group, name, years: { $size: 0 } },
                            update: { $unset: { years: 1, missing: 1 } },
                        },
                    },
                ],
                { session }
            )
            .then(hasEffect);
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
    return (
        (await getDetailsCollection())
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
            /*.updateMany(
{ group, 'years.amounts.variant': variant } as UpdateFilter<Details>,
{ $set: { 'years.$[].amounts.$[variant].variant': newVariant } },
{ arrayFilters: [{ 'variant.variant': variant }], session }
)*/
            .then(hasEffect)
            .catch(hasDuplicates)
    );
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
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !newGroup) {
        return false;
    }
    return (await getDetailsCollection())
        .updateOne({ group, name }, { $set: { group: newGroup } }, { session })
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

export async function getYearsAndDetails(): Promise<{ years: number[]; details: Details[] }> {
    const years = getYears();
    return { years, details: await getDetails(years) };
}
