import type { AnyBulkWriteOperation, ClientSession, Filter, WithId } from 'mongodb';

import { addVariantAmount, getCombinedAmounts, getVariantAmount } from '~/common/utils/amounts';
import type {
    ApplyReview,
    History,
    MoveConsumedToRecycled,
    Product,
    ProductYearIdentity,
    SetAmounts,
    SetProductMissing,
    SetProductRemoving,
    TransferAmounts,
    Update,
    VariantAmount,
} from '~/schema';
import { buildHistoryPipeline } from '~/server/data/history';
import { assertSuccess, hasEffect } from '~/server/data/utils';
import { copyVariants } from '~/server/data/variants';
import { db } from '~/server/db';

export const cleanupRecycled = ({ recycled, suspicious, home, expiresAt, ...v }: VariantAmount): VariantAmount => ({
    ...v,
    ...(recycled != null ? { recycled } : {}),
    ...(suspicious ? { suspicious } : {}),
    ...(home ? { home } : {}),
    ...(expiresAt != null ? { expiresAt } : {}),
});

export const hasAmount = (a: VariantAmount) => a.amount > 0;

function combineStockRows(rows: readonly VariantAmount[]): VariantAmount[] {
    const combined = new Map<string, VariantAmount>();
    for (const row of rows) {
        const key = JSON.stringify([
            row.variant,
            !!row.suspicious,
            !!row.home,
            row.expiresAt === undefined ? '' : row.expiresAt,
        ]);
        const previous = combined.get(key);
        combined.set(key, previous ? { ...previous, amount: previous.amount + row.amount } : row);
    }
    return [...combined.values()];
}

export async function setAmounts(
    { group, name, year, amounts: changes, comment }: SetAmounts,
    user: string | undefined,
    session: ClientSession,
    mergePrevious = false
): Promise<boolean> {
    if (!group || !name || !changes?.length) {
        return false;
    }
    const filter: Filter<Product> = { group, name };
    const operations: AnyBulkWriteOperation<Product>[] = [];

    const col = (await db()).collection<Product>('products');
    const product = await col.findOne<Pick<Product, 'years' | 'missing' | 'updates'>>(filter, {
        projection: { years: 1, missing: 1, updates: 1 },
        session,
    });
    const amounts = year
        ? combineStockRows(product?.years?.find((y) => y.year === year)?.amounts ?? [])
        : (getCombinedAmounts(product?.years) ?? []);

    // Additions in the same edit are available to all its removals. Competing removals
    // use the remaining balance in request order so each history line records what it took.
    let balances = changes.filter(hasAmount).reduce(addVariantAmount, amounts);
    const historyAmounts: VariantAmount[] = [];
    const pantryConsumed = new Set<string>();
    for (const change of changes) {
        const { variant, suspicious, home, expiresAt } = change;
        const amount =
            change.amount < 0
                ? -Math.min(
                      -change.amount,
                      Math.max(0, getVariantAmount(balances, variant, suspicious, home, expiresAt))
                  )
                : change.amount;
        if (!amount) {
            continue;
        }
        const applied = cleanupRecycled({ ...change, amount });
        historyAmounts.push(applied);
        if (amount < 0) {
            balances = addVariantAmount(balances, applied);
            if (!home && change.recycled === false) {
                pantryConsumed.add(variant);
            }
        }
    }
    for (const variant of pantryConsumed) {
        const homeBalance = Math.min(
            getVariantAmount(amounts, variant, false, true),
            getVariantAmount(balances, variant, false, true)
        );
        if (homeBalance > 0) {
            const applied = { variant, amount: -homeBalance, recycled: false, home: true };
            historyAmounts.push(applied);
            balances = addVariantAmount(balances, applied);
        }
    }
    const updates = balances.filter(hasAmount).map(cleanupRecycled);
    if (!historyAmounts.length || (!amounts.length && !updates.length)) {
        return false;
    }

    const newEntry = {
        time: Date.now(),
        user,
        ...(comment ? { comment } : {}),
        years: [{ year, amounts: historyAmounts }],
    };
    const previousUpdates = product?.updates ?? [];
    const previousEntry = previousUpdates.at(-1);
    const newUpdates =
        mergePrevious && previousEntry
            ? [
                  ...previousUpdates.slice(0, -1),
                  { ...previousEntry, years: [...previousEntry.years, ...newEntry.years] },
              ]
            : [...previousUpdates, newEntry];
    // clear undates on new update
    operations.push({ updateOne: { filter, update: { $set: { updates: newUpdates }, $unset: { undates: 1 } } } });

    // Drop empty stock years while keeping the applied changes in history.
    if (!updates.length) {
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
    if (product?.missing && historyAmounts.some((a) => !a.recycled && a.amount < 0)) {
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
    { group, name, year, targetGroup, targetName, amounts, comment }: TransferAmounts,
    user: string | undefined,
    session: ClientSession
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

    const col = (await db()).collection<Product>('products');
    const source = await col.findOne({ group, name }, { projection: { years: 1 }, session });
    const target = await col.findOne({ group: targetGroup, name: targetName }, { projection: { _id: 1 }, session });
    if (!source || !target) {
        return false;
    }
    const sourceAmounts =
        (year ? source.years?.find((entry) => entry.year === year)?.amounts : getCombinedAmounts(source.years)) ?? [];
    if (
        requested.some(
            (amount) =>
                getVariantAmount(sourceAmounts, amount.variant, !!amount.suspicious, !!amount.home, amount.expiresAt) <
                amount.amount
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
    const sourceChanged = await setAmounts({ group, name, year, amounts: removed, comment }, user, session);
    const targetChanged = await setAmounts(
        { group: targetGroup, name: targetName, year, amounts: requested, comment },
        user,
        session
    );
    await assertSuccess(sourceChanged && targetChanged);
    return true;
}

export async function moveConsumedToRecycled(
    { group, name, year, variant, amount, flags = {}, sourceSessionId }: MoveConsumedToRecycled,
    user: string | undefined,
    session: ClientSession
): Promise<boolean> {
    if (!group || !name || !variant || !(amount > 0)) {
        return false;
    }

    const col = (await db()).collection<Product>('products');
    const source = (await getProductUpdates({ group, name, year }, session)).find(
        (entry) => entry.sessionId === sourceSessionId
    );
    const available = source?.amounts?.find(
        (line) =>
            line.variant === variant &&
            line.recycled === false &&
            !!line.home === !!flags.home &&
            !!line.suspicious === !!flags.suspicious &&
            line.expiresAt === flags.expiresAt
    );
    if (!source || !available || available.amount > -amount) {
        return false;
    }
    // Leaves old history untouched and records the correction as its own update entry (net
    // effect on current stock is zero) so it plays nicely with undo/redo like any other update.
    const newEntry: Update = {
        time: Date.now(),
        user,
        recycleSource: { time: source.time, ...(source.user ? { user: source.user } : {}) },
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

    return col
        .updateOne({ group, name }, { $push: { updates: newEntry }, $unset: { undates: 1 } }, { session })
        .then(hasEffect);
}

function invertAmounts(amounts: readonly VariantAmount[]): VariantAmount[] {
    return amounts.map((a) => ({ ...a, amount: -a.amount }));
}

export async function undoProduct(
    { group, name, year }: ProductYearIdentity,
    session: ClientSession
): Promise<boolean> {
    if (!group || !name) {
        return false;
    }

    const filter: Filter<Product> = { group, name };
    const col = (await db()).collection<Product>('products');
    const product = await col.findOne<Pick<Product, 'years' | 'updates' | 'undates'>>(filter, {
        projection: { years: 1, updates: 1, undates: 1 },
        session,
    });

    const updates = product?.updates ?? [];
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
}

export async function redoProduct(
    { group, name, year }: ProductYearIdentity,
    session: ClientSession
): Promise<boolean> {
    if (!group || !name) {
        return false;
    }

    const filter: Filter<Product> = { group, name };
    const col = (await db()).collection<Product>('products');
    const product = await col.findOne<Pick<Product, 'years' | 'updates' | 'undates'>>(filter, {
        projection: { years: 1, updates: 1, undates: 1 },
        session,
    });

    const undates = product?.undates ?? [];
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
        const newAmounts = entryAmounts.reduce(addVariantAmount, currentAmounts).filter(hasAmount).map(cleanupRecycled);

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
}

export async function setRemoving(
    { group, name, year, removing }: SetProductRemoving,
    session: ClientSession
): Promise<boolean> {
    if (!group || !name || !year) {
        return false;
    }
    return (await db())
        .collection<Product>('products')
        .updateOne(
            { group, name, 'years.year': year } as Filter<Product>,
            { [removing ? '$set' : '$unset']: { 'years.$.removing': removing } },
            { session }
        )
        .then(hasEffect);
}

export async function setMissing(
    { group, name, missing }: SetProductMissing,
    session: ClientSession
): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    return (await db())
        .collection('products')
        .updateOne({ group, name }, { [missing ? '$set' : '$unset']: { missing } }, { session })
        .then(hasEffect);
}

export async function setMissingBulk({ updates }: ApplyReview, session: ClientSession): Promise<boolean> {
    if (!updates?.length) {
        return false;
    }
    const operations: AnyBulkWriteOperation<Product>[] = updates.map(({ group, name, missing }) => ({
        updateOne: {
            filter: { group, name },
            update: missing ? { $set: { missing: true } } : { $unset: { missing: 1 } },
        },
    }));
    return (await db()).collection<Product>('products').bulkWrite(operations, { session }).then(hasEffect);
}

async function getProductHistory(
    { group, name, year }: ProductYearIdentity,
    field: 'updates' | 'undates',
    session: ClientSession
): Promise<History[]> {
    return (await db())
        .collection('products')
        .aggregate<WithId<History>>(
            buildHistoryPipeline(
                group,
                name,
                field,
                { [`${field}.years`]: { $elemMatch: { year } } },
                undefined,
                { $eq: ['$$y.year', year] },
                field === 'updates'
            ),
            { session }
        )
        .toArray();
}

export async function getProductUpdates(identity: ProductYearIdentity, session: ClientSession): Promise<History[]> {
    return getProductHistory(identity, 'updates', session);
}

export async function getProductUndates(identity: ProductYearIdentity, session: ClientSession): Promise<History[]> {
    return getProductHistory(identity, 'undates', session);
}
