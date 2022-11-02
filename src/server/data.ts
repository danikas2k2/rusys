import moment from 'moment';
import type Nedb from 'nedb';
import nedb from 'nedb-promises';
import path from 'path';
import type { Details, Name, NamedValues, Values, Variant, Year } from '~/store/details.types';

export const db = {
    details: nedb.create({ filename: path.resolve(__dirname, '../../data/details.jsonl'), autoload: true }),
    updates: nedb.create({ filename: path.resolve(__dirname, '../../data/updates.jsonl'), autoload: true }),
    missing: nedb.create({ filename: path.resolve(__dirname, '../../data/missing.jsonl'), autoload: true }),
};

(async () => {
    await db.details.ensureIndex({ fieldName: 'name', unique: true });
    await db.updates.ensureIndex({ fieldName: 'name' });
    await db.updates.ensureIndex({ fieldName: 'time' });
})();

const MAX_YEARS = 5;
const SWITCH_MONTH = 6;

export function getYears(): Year[] {
    return [...Array(MAX_YEARS)].map(
        (y, i) => +moment().subtract(i, 'years').subtract(SWITCH_MONTH, 'months').format('YY')
    );
}

export async function getDetails(): Promise<Details> {
    const details = await db.details.find<NamedValues>({});
    // if (isEmpty(details)) {
    //     await db.details.insert(Object.entries(initialDetails).map(([k, v]) => ({ _id: k, ...v })));
    //     return initialDetails;
    // }
    return Object.fromEntries(details.map(({ _id, name, ...v }) => [name, v]));
}

export async function setDetails(name: Name, values: Values): Promise<Details> {
    await addUpdates(name, values);
    await db.details.update({ name }, { name, ...values });
    await (db.details as unknown as Nedb.Persistence).compactDatafile?.();
    return getDetails();
}

export async function addUpdates(name: Name, values: Values | null): Promise<void> {
    const prev = await db.details.findOne<NamedValues>({ name });
    const { _id, name: _name, ...prevValues } = prev ?? {};
    const diff = getDiff(prev ? (prevValues as Values) : null, values);
    if (diff) {
        const time = Date.now();
        await db.updates.insert({ name, time, ...diff });
        await (db.updates as unknown as Nedb.Persistence).compactDatafile?.();
    }
}

function getDiff(prevValues: Values | null, values: Values | null): Values | null {
    const diff: Values = {};
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

    function addDiff(year: Year, variant: Variant, after?: number | null, before?: number | null) {
        const d = (after ?? 0) - (before ?? 0);
        if (d !== 0) {
            diff[year] = diff[year] ?? {};
            diff[year][variant] = d;
        }
    }
}

export async function setName(name: Name, newName: Name): Promise<Details> {
    if (name !== newName) {
        await db.details.update({ name }, { name: newName }, { multi: true });
        await (db.details as unknown as Nedb.Persistence).compactDatafile?.();
        await db.updates.update({ name }, { name: newName }, { multi: true });
        await (db.updates as unknown as Nedb.Persistence).compactDatafile?.();
    }
    return getDetails();
}

export async function remove(name: Name): Promise<Details> {
    await db.details.remove({ name }, { multi: true });
    await (db.details as unknown as Nedb.Persistence).compactDatafile?.();
    await db.updates.remove({ name }, { multi: true });
    await (db.updates as unknown as Nedb.Persistence).compactDatafile?.();
    return getDetails();
}

export async function getMissing(): Promise<Name[]> {
    return ((await db.missing.findOne({})) as any)?.missing || [];
}

export async function setMissing(missing: Name[]): Promise<Name[]> {
    await db.missing.remove({}, { multi: true });
    await db.missing.insert({ missing });
    await (db.missing as unknown as Nedb.Persistence).compactDatafile?.();
    return getMissing();
}
