import type { AnyBulkWriteOperation, ClientSession, Filter, UpdateFilter, WithId } from 'mongodb';

import type { History, Product, Update, VariantAmount } from '~/common/data';
import { addVariantAmount, getCombinedAmounts, getVariantAmount } from '~/common/utils/amounts';
import { buildHistoryPipeline } from '~/server/data/history';
import { hasEffect } from '~/server/data/utils';
import { copyVariants } from '~/server/data/variants';
import { db, withTransaction } from '~/server/db';

export const cleanupRecycled = ({ recycled, suspicious, home, expiresAt, ...v }: VariantAmount): VariantAmount => ({
    ...v,
    ...(recycled != null ? { recycled } : {}),
    ...(suspicious ? { suspicious } : {}),
    ...(home ? { home } : {}),
    ...(expiresAt ? { expiresAt } : {}),
});

export const hasAmount = (a: VariantAmount) => a.amount > 0;

export async function setAmounts(
    group: string,
    name: string,
    year: number,
    changes: readonly VariantAmount[] = [],
    user?: string,
    comment?: string
): Promise<boolean> {
    if (!group || !name || !changes.length) {
        return false;
    }

    return withTransaction((session) => setAmountsInTransaction(group, name, year, changes, user, comment, session));
}

async function setAmountsInTransaction(
    group: string,
    name: string,
    year: number,
    changes: readonly VariantAmount[],
    user: string | undefined,
    comment: string | undefined,
    session: ClientSession
): Promise<boolean> {
    const filter: UpdateFilter<Product> = { group, name };
    const operations: AnyBulkWriteOperation<Product>[] = [];

    const col = (await db()).collection<Product>('products');
    const product = await col.findOne(filter, {
        projection: { years: 1, missing: 1, updates: 1 },
        session,
    });
    const amounts =
        (year ? product?.years?.find((y) => y.year === year)?.amounts : getCombinedAmounts(product?.years)) ?? [];

    // auto-consume home balance when cellar consumption starts for that variant
    const autoHomeConsumes: VariantAmount[] = [];
    for (const change of changes) {
        if (!change.home && change.recycled === false && change.amount < 0) {
            const homeBalance = getVariantAmount(amounts, change.variant, false, true);
            if (homeBalance > 0) {
                autoHomeConsumes.push({
                    variant: change.variant,
                    amount: -homeBalance,
                    recycled: false,
                    home: true,
                });
            }
        }
    }
    const allChanges = autoHomeConsumes.length ? [...changes, ...autoHomeConsumes] : changes;

    const updates = allChanges.reduce(addVariantAmount, amounts).filter(hasAmount).map(cleanupRecycled);

    // save all change types (consumed=recycled:false, recycled=recycled:true, updated=no recycled field)
    const historyAmounts = allChanges.map(cleanupRecycled);
    const newEntry = {
        time: Date.now(),
        user,
        ...(comment ? { comment } : {}),
        years: [{ year, amounts: historyAmounts }],
    };
    const newUpdates = [...(product?.updates ?? []), newEntry];
    // clear undates on new update
    operations.push({ updateOne: { filter, update: { $set: { updates: newUpdates }, $unset: { undates: 1 } } } });

    // no updates
    if (!updates.length) {
        if (!amounts.length) {
            return false;
        }
        operations.push({
            updateOne: {
                filter,
                update: year ? { $pull: { years: { year } } } : { $unset: { years: 1, missing: 1 } },
            },
        });
    } else if (!amounts.length) {
        operations.push({ updateOne: { filter, update: { $push: { years: { year, amounts: updates } } } } });
    } else {
        operations.push({
            updateOne: year
                ? {
                      filter,
                      update: { $set: { 'years.$[y].amounts': updates } },
                      arrayFilters: [{ 'y.year': year }],
                  }
                : {
                      filter,
                      update: { $set: { years: [{ year, amounts: updates }] } },
                  },
        });
    }

    // remove missing flag if amount decreased but not recycled
    if (product?.missing && changes.some((a) => !a.recycled && a.amount < 0)) {
        operations.push({ updateOne: { filter, update: { $unset: { missing: 1 } } } });
    }

    // clear all other empty years
    operations.push({
        updateOne: {
            filter: { group, name, years: { $size: 0 } },
            update: { $unset: { years: 1, missing: 1 } },
        },
    });

    return await col.bulkWrite(operations, { session }).then(hasEffect);
}

/** Moves stock rows between products, preserving their flags and creating missing target-group variants. */
export async function transferAmounts(
    group: string,
    name: string,
    year: number,
    targetGroup: string,
    targetName: string,
    amounts: readonly VariantAmount[],
    user?: string,
    comment?: string
): Promise<boolean> {
    if (
        !group ||
        !name ||
        !targetGroup ||
        !targetName ||
        (group === targetGroup && name === targetName) ||
        !amounts.length
    ) {
        return false;
    }
    if (amounts.some((amount) => !amount.variant || !(amount.amount > 0))) {
        return false;
    }
    // A client normally submits one row per variant key, but combine duplicate rows before
    // validating the balance so an API request cannot transfer more than the source holds.
    const requested = amounts.reduce(addVariantAmount, [] as readonly VariantAmount[]);

    return withTransaction(async (session) => {
        const col = (await db()).collection<Product>('products');
        const source = await col.findOne({ group, name }, { projection: { years: 1 }, session });
        const target = await col.findOne({ group: targetGroup, name: targetName }, { projection: { _id: 1 }, session });
        if (!source || !target) {
            return false;
        }
        const sourceAmounts =
            (year ? source.years?.find((entry) => entry.year === year)?.amounts : getCombinedAmounts(source.years)) ??
            [];
        if (
            requested.some(
                (amount) =>
                    getVariantAmount(
                        sourceAmounts,
                        amount.variant,
                        !!amount.suspicious,
                        !!amount.home,
                        amount.expiresAt
                    ) < amount.amount
            )
        ) {
            return false;
        }

        if (group !== targetGroup) {
            await copyVariants(group, targetGroup, [...new Set(requested.map((amount) => amount.variant))], session);
        }

        const removed = requested.map((amount) => ({ ...amount, amount: -amount.amount }));
        // MongoDB sessions do not support concurrent operations. Both writes remain atomic because
        // the surrounding transaction commits only after the second one succeeds.
        const sourceChanged = await setAmountsInTransaction(group, name, year, removed, user, comment, session);
        const targetChanged = await setAmountsInTransaction(
            targetGroup,
            targetName,
            year,
            requested,
            user,
            comment,
            session
        );
        return sourceChanged && targetChanged;
    });
}

export async function moveConsumedToRecycled(
    group: string,
    name: string,
    year: number,
    variant: string,
    amount: number,
    flags: Pick<VariantAmount, 'suspicious' | 'home' | 'expiresAt'> = {},
    user?: string
): Promise<boolean> {
    if (!group || !name || !variant || !(amount > 0)) {
        return false;
    }

    const col = (await db()).collection<Product>('products');
    // Leaves old history untouched and records the correction as its own update entry (net
    // effect on current stock is zero) so it plays nicely with undo/redo like any other update.
    const newEntry: Update = {
        time: Date.now(),
        user,
        years: [
            {
                year,
                amounts: [
                    cleanupRecycled({ variant, amount, recycled: false, ...flags }),
                    cleanupRecycled({ variant, amount: -amount, recycled: true, ...flags }),
                ],
            },
        ],
    };

    return col.updateOne({ group, name }, { $push: { updates: newEntry }, $unset: { undates: 1 } }).then(hasEffect);
}

function invertAmounts(amounts: readonly VariantAmount[]): VariantAmount[] {
    return amounts.map((a) => ({ ...a, amount: -a.amount }));
}

export async function undoProduct(group: string, name: string, year: number): Promise<boolean> {
    if (!group || !name) {
        return false;
    }

    return withTransaction(async (session) => {
        const filter: UpdateFilter<Product> = { group, name };
        const col = (await db()).collection<Product>('products');
        const product = await col.findOne(filter, {
            projection: { years: 1, updates: 1, undates: 1 },
            session,
        });

        const updates = (product?.updates ?? []) as Update[];
        const entryIndex = [...updates].reverse().findIndex((u) => u.years.some((y) => y.year === year));
        if (entryIndex === -1) {
            return false;
        }
        const realIndex = updates.length - 1 - entryIndex;
        const entry = updates[realIndex];
        const newUpdates = [...updates.slice(0, realIndex), ...updates.slice(realIndex + 1)];
        const newUndates = [...(product?.undates ?? []), entry];

        const operations: AnyBulkWriteOperation<Product>[] = [
            { updateOne: { filter, update: { $set: { updates: newUpdates, undates: newUndates } } } },
        ];

        // apply inverted amounts to years
        for (const { year: entryYear, amounts: entryAmounts } of entry.years) {
            const inverted = invertAmounts(entryAmounts);
            const currentAmounts =
                (entryYear
                    ? product?.years?.find((y) => y.year === entryYear)?.amounts
                    : getCombinedAmounts(product?.years)) ?? [];
            const newAmounts = inverted.reduce(addVariantAmount, currentAmounts).filter(hasAmount).map(cleanupRecycled);

            if (!newAmounts.length) {
                operations.push({
                    updateOne: {
                        filter,
                        update: entryYear ? { $pull: { years: { year: entryYear } } } : { $unset: { years: 1 } },
                    },
                });
            } else if (!currentAmounts.length) {
                operations.push({
                    updateOne: { filter, update: { $push: { years: { year: entryYear, amounts: newAmounts } } } },
                });
            } else {
                operations.push({
                    updateOne: entryYear
                        ? {
                              filter,
                              update: { $set: { 'years.$[y].amounts': newAmounts } },
                              arrayFilters: [{ 'y.year': entryYear }],
                          }
                        : {
                              filter,
                              update: { $set: { years: [{ year: entryYear, amounts: newAmounts }] } },
                          },
                });
            }
        }

        operations.push({
            updateOne: {
                filter: { group, name, years: { $size: 0 } },
                update: { $unset: { years: 1, missing: 1 } },
            },
        });

        return await col.bulkWrite(operations, { session }).then(hasEffect);
    });
}

export async function redoProduct(group: string, name: string, year: number): Promise<boolean> {
    if (!group || !name) {
        return false;
    }

    return withTransaction(async (session) => {
        const filter: UpdateFilter<Product> = { group, name };
        const col = (await db()).collection<Product>('products');
        const product = await col.findOne(filter, {
            projection: { years: 1, updates: 1, undates: 1 },
            session,
        });

        const undates = (product?.undates ?? []) as Update[];
        const entryIndex = [...undates].reverse().findIndex((u) => u.years.some((y) => y.year === year));
        if (entryIndex === -1) {
            return false;
        }
        const realIndex = undates.length - 1 - entryIndex;
        const entry = undates[realIndex];
        const newUndates = [...undates.slice(0, realIndex), ...undates.slice(realIndex + 1)];
        const newUpdates = [...(product?.updates ?? []), entry];

        const operations: AnyBulkWriteOperation<Product>[] = [
            {
                updateOne: {
                    filter,
                    update: newUndates.length
                        ? { $set: { updates: newUpdates, undates: newUndates } }
                        : { $set: { updates: newUpdates }, $unset: { undates: 1 } },
                },
            },
        ];

        // re-apply original amounts to years
        for (const { year: entryYear, amounts: entryAmounts } of entry.years) {
            const currentAmounts =
                (entryYear
                    ? product?.years?.find((y) => y.year === entryYear)?.amounts
                    : getCombinedAmounts(product?.years)) ?? [];
            const newAmounts = entryAmounts
                .reduce(addVariantAmount, currentAmounts)
                .filter(hasAmount)
                .map(cleanupRecycled);

            if (!newAmounts.length) {
                operations.push({
                    updateOne: {
                        filter,
                        update: entryYear ? { $pull: { years: { year: entryYear } } } : { $unset: { years: 1 } },
                    },
                });
            } else if (!currentAmounts.length) {
                operations.push({
                    updateOne: { filter, update: { $push: { years: { year: entryYear, amounts: newAmounts } } } },
                });
            } else {
                operations.push({
                    updateOne: entryYear
                        ? {
                              filter,
                              update: { $set: { 'years.$[y].amounts': newAmounts } },
                              arrayFilters: [{ 'y.year': entryYear }],
                          }
                        : {
                              filter,
                              update: { $set: { years: [{ year: entryYear, amounts: newAmounts }] } },
                          },
                });
            }
        }

        operations.push({
            updateOne: {
                filter: { group, name, years: { $size: 0 } },
                update: { $unset: { years: 1, missing: 1 } },
            },
        });

        return await col.bulkWrite(operations, { session }).then(hasEffect);
    });
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
        .collection('products')
        .updateOne(
            { group, name, 'years.year': year } as Filter<Product>,
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
        .collection('products')
        .updateOne({ group, name }, { [missing ? '$set' : '$unset']: { missing } }, { session })
        .then(hasEffect);
}

export async function setMissingBulk(
    updates: readonly { group: string; name: string; missing: boolean }[],
    session?: ClientSession
): Promise<boolean> {
    if (!updates?.length) {
        return false;
    }
    const operations: AnyBulkWriteOperation<Product>[] = updates.map(({ group, name, missing }) => ({
        updateOne: {
            filter: { group, name },
            update: missing ? { $set: { missing: true } } : { $unset: { missing: 1 } },
        },
    }));
    return (await db()).collection('products').bulkWrite(operations, { session }).then(hasEffect);
}

async function getProductHistory(
    group: string,
    name: string,
    year: number,
    field: 'updates' | 'undates'
): Promise<History[]> {
    return (await db())
        .collection('products')
        .aggregate<WithId<History>>(
            buildHistoryPipeline(group, name, field, { [`${field}.years`]: { $elemMatch: { year } } }, undefined, {
                $eq: ['$$y.year', year],
            })
        )
        .toArray();
}

export async function getProductUpdates(group: string, name: string, year: number): Promise<History[]> {
    return getProductHistory(group, name, year, 'updates');
}

export async function getProductUndates(group: string, name: string, year: number): Promise<History[]> {
    return getProductHistory(group, name, year, 'undates');
}
