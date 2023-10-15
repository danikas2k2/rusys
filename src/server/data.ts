import moment from 'moment';
import type Nedb from 'nedb';
import nedb from 'nedb-promises';
import path from 'path';
import { type Amount, type Amounts, type AmountSet, type NamedAmounts, type Variant } from '~/store/details/types';
import { type NamedRemoving, type RemovingSet } from '~/store/removing/types';
import { type Name, type Year } from '~/store/types';

const dbPath = process.env.DATA_PATH || path.resolve(process.cwd(), 'data');
export const db = {
    details: nedb.create({ filename: path.resolve(dbPath, 'details.jsonl'), autoload: true }),
    updates: nedb.create({ filename: path.resolve(dbPath, 'updates.jsonl'), autoload: true }),
    missing: nedb.create({ filename: path.resolve(dbPath, 'missing.jsonl'), autoload: true }),
    removing: nedb.create({ filename: path.resolve(dbPath, 'removing.jsonl'), autoload: true }),
};

(async () => {
    await db.details.ensureIndex({ fieldName: 'name', unique: true });
    await db.updates.ensureIndex({ fieldName: 'name' });
    await db.updates.ensureIndex({ fieldName: 'time' });
    await db.removing.ensureIndex({ fieldName: 'name', unique: true });
})();

const MAX_YEARS = 5;
const SWITCH_MONTH = 4;

export function getYears(): Year[] {
    return [...Array(MAX_YEARS)].map(
        (y, i) => +moment().subtract(i, 'years').subtract(SWITCH_MONTH, 'months').format('YY')
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterByYear<T>(data: Record<string, any>[], years: number[]): T {
    return Object.fromEntries(
        data.map(({ _id, name, ...v }) => [
            name,
            Object.fromEntries(Object.entries(v).filter(([y]) => years.includes(+y))),
        ])
    );
}

export async function getDetails(years: number[]): Promise<AmountSet> {
    return filterByYear(await db.details.find<NamedAmounts>({}), years);
}

export async function setDetails(name: Name, values: Amounts): Promise<AmountSet> {
    await addUpdates(name, values);
    await db.details.update({ name }, { name, ...values }, { upsert: true });
    await (db.details as unknown as Nedb.Persistence).compactDatafile?.();
    return getDetails(getYears());
}

export async function updateDetails(name: Name, year: Year, value: Amount): Promise<AmountSet> {
    await addUpdates(name, { [year]: value });
    await db.details.update(
        { name },
        { [Object.keys(value).length ? '$set' : '$unset']: { [year]: value } },
        { upsert: true }
    );
    await (db.details as unknown as Nedb.Persistence).compactDatafile?.();
    return getDetails(getYears());
}

export async function addUpdates(name: Name, values: Amounts | null): Promise<void> {
    const prev = await db.details.findOne<NamedAmounts>({ name });
    const { _id, name: _name, ...prevValues } = prev ?? {};
    const diff = getDiff(prev ? (prevValues as Amounts) : null, values);
    if (diff) {
        const time = Date.now();
        await db.updates.insert({ name, time, ...diff });
        await (db.updates as unknown as Nedb.Persistence).compactDatafile?.();
    }
}

export async function getRemoving(years: number[]): Promise<RemovingSet> {
    return filterByYear(await db.removing.find<NamedRemoving>({}), years);
}

export async function setRemoving(name: Name, year: Year, removing: boolean): Promise<RemovingSet> {
    await db.removing.update({ name }, { [removing ? '$set' : '$unset']: { [year]: true } }, { upsert: true });
    await (db.removing as unknown as Nedb.Persistence).compactDatafile?.();
    return getRemoving(getYears());
}

function getDiff(prevValues: Amounts | null, values: Amounts | null): Amounts | null {
    const diff: Amounts = {};
    if (values) {
        for (const [k, v] of Object.entries(values)) {
            const year = k as unknown as Year;
            const prev = prevValues?.[year] ?? {};
            for (const [kk, vv] of Object.entries(v)) {
                const variant = kk as unknown as Variant;
                addDiff(year, variant, vv, prev[variant]);
            }
        }
    }
    if (prevValues) {
        for (const [k, v] of Object.entries(prevValues)) {
            const year = k as unknown as Year;
            for (const [kk, vv] of Object.entries(v)) {
                const variant = kk as unknown as Variant;
                if (!values?.[year]?.[variant]) {
                    addDiff(year, variant, null, vv);
                }
            }
        }
    }
    return Object.keys(diff).length ? diff : null;

    function addDiff(year: Year, variant: Variant, after?: number | null, before?: number | null): void {
        const d = (after ?? 0) - (before ?? 0);
        if (d !== 0) {
            diff[year] = diff[year] ?? {};
            diff[year][variant] = d;
        }
    }
}

export async function setName(name: Name, newName: Name): Promise<boolean> {
    if (name !== newName) {
        const updated = await db.details.update({ name }, { $set: { name: newName } }, { multi: true });
        await (db.details as unknown as Nedb.Persistence).compactDatafile?.();
        await db.updates.update({ name }, { $set: { name: newName } }, { multi: true });
        await (db.updates as unknown as Nedb.Persistence).compactDatafile?.();
        await db.removing.update({ name }, { $set: { name: newName } }, { multi: true });
        await (db.removing as unknown as Nedb.Persistence).compactDatafile?.();
        return updated > 0;
    }
    return false;
}

export async function remove(name: Name): Promise<boolean> {
    const removed = await db.details.remove({ name }, { multi: true });
    await (db.details as unknown as Nedb.Persistence).compactDatafile?.();
    await db.updates.remove({ name }, { multi: true });
    await (db.updates as unknown as Nedb.Persistence).compactDatafile?.();
    await db.removing.remove({ name }, { multi: true });
    await (db.removing as unknown as Nedb.Persistence).compactDatafile?.();
    return removed > 0;
}

export async function getMissing(): Promise<Name[]> {
    return ((await db.missing.findOne({})) as { missing: [] })?.missing || [];
}

export async function setMissing(missing: Name[]): Promise<Name[]> {
    await db.missing.remove({}, { multi: true });
    await db.missing.insert({ missing });
    await (db.missing as unknown as Nedb.Persistence).compactDatafile?.();
    return getMissing();
}
