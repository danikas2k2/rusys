import moment from 'moment';
import { compact, DETAILS, UPDATES } from '~/server/db';
import {
    type Amount,
    type Amounts,
    type AmountSet,
    type NamedAmounts,
    type TimedAmounts,
    type Variant,
} from '~/store/details/types';
import { type Name, type Year } from '~/store/types';

export async function getSummary(years: number[]): Promise<AmountSet> {
    const from = moment()
        .year(2000 + Math.min(...years))
        .startOf('year');
    const to = moment()
        .year(2000 + Math.max(...years))
        .endOf('year');
    const data = await UPDATES.find<TimedAmounts>(
        {
            time: { $gte: from.valueOf(), $lte: to.valueOf() },
        },
        { _id: 0, name: 1, time: 1, ...Object.fromEntries(years.map((y) => [y, 1])) }
    ).sort({ name: 1, time: 1 });

    const grouped: AmountSet = {};
    for (const { name, time, ...v } of data) {
        const year: Year = +moment(time).format('YY');
        for (const yv of Object.values(v)) {
            for (const [k, v] of Object.entries(yv)) {
                if (v >= 0) {
                    continue;
                }
                const variant = k as string as Variant;
                const vv = grouped[name]?.[year]?.[variant] ?? 0;
                if (!(name in grouped)) {
                    grouped[name] = { [year]: {} };
                } else if (!(year in grouped[name])) {
                    grouped[name][year] = {};
                }
                grouped[name][year][variant] = vv - v;
            }
        }
    }
    return grouped;
}

export async function addUpdates(name: Name, values: Amounts | null): Promise<boolean> {
    const prev = await DETAILS.findOne<NamedAmounts>({ name });
    const { _id, name: _name, ...prevValues } = prev ?? {};
    const diff = getDiff(prev ? (prevValues as Amounts) : null, values);
    if (diff) {
        const time = Date.now();
        await UPDATES.insert({ name, time, ...diff });
        await compact(UPDATES);
        return true;
    }
    return false;
}

export async function addUpdate(name: Name, year: Year, value: Amount | null): Promise<boolean> {
    const prev = await DETAILS.findOne<NamedAmounts>({ name, [year]: { $exists: true } }, { _id: 0, [year]: 1 });
    const diff = getDiff(prev, value ? { [year]: value } : null);
    if (diff) {
        const time = Date.now();
        await UPDATES.insert({ name, time, ...diff });
        await compact(UPDATES);
        return true;
    }
    return false;
}

export function getDiff(prevValues: Amounts | null, values: Amounts | null): Amounts | null {
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

export async function renameUpdates(name: Name, newName: Name): Promise<boolean> {
    const updated = await UPDATES.update({ name }, { $set: { name: newName } }, { multi: true });
    if (updated) {
        await compact(UPDATES);
        return true;
    }
    return false;
}

export async function removeUpdates(name: Name): Promise<boolean> {
    const removed = await UPDATES.remove({ name }, { multi: true });
    if (removed) {
        await compact(UPDATES);
        return true;
    }
    return false;
}
