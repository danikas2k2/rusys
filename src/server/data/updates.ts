import moment from 'moment';
import { getGroupAndNameQuery, getGroupQuery } from '~/server/data/utils';
import { compact, DETAILS, UPDATES } from '~/server/db';
import { type Amount, type Amounts, type AmountSet, type TimedAmounts, type Variant } from '~/state/details/types';
import { type Group, type Name, type Year } from '~/state/types';

export async function getSummary(years: number[]): Promise<AmountSet> {
    const startYear = 2000 + Math.min(...years);
    const startMonth = 9; // September
    const s = `${startYear}-0${startMonth}-01`;
    const from = moment(s);
    const data = await UPDATES.find<TimedAmounts>(
        { time: { $gte: from.valueOf() } },
        { _id: 0, group: 1, name: 1, time: 1, ...Object.fromEntries(years.map((y) => [y, 1])) }
    ).sort({ group: 1, name: 1, time: 1 });

    const grouped: AmountSet = {};
    for (const { group = '', name, time, ...v } of data) {
        const t = moment(time);
        const year: Year = +t.format('YY') - +(+t.format('M') < startMonth);
        for (const yv of Object.values(v)) {
            for (const [k, v] of Object.entries(yv)) {
                if (v >= 0) {
                    continue;
                }
                const variant = k as string as Variant;
                const vv = grouped[group]?.[name]?.[year]?.[variant] ?? 0;
                if (!(group in grouped)) {
                    grouped[group] = { [name]: { [year]: {} } };
                } else if (!(name in grouped[group])) {
                    grouped[group][name] = { [year]: {} };
                } else if (!(year in grouped[group][name])) {
                    grouped[group][name][year] = {};
                }
                grouped[group][name][year][variant] = vv - v;
            }
        }
    }
    return grouped;
}

export async function addUpdates(group: Group, name: Name, values?: Amounts | null): Promise<boolean> {
    const prev = await DETAILS.findOne(getGroupAndNameQuery(group, name));
    const { _id, group: _group, name: _name, ...prevValues } = prev ?? {};
    const diff = getDiff(prev ? (prevValues as Amounts) : undefined, values);
    if (!diff) {
        return false;
    }
    const time = Date.now();
    await UPDATES.insert({ group, name, time, ...diff });
    await compact(UPDATES);
    return true;
}

export async function addUpdate(group: Group, name: Name, year: Year, value?: Amount | null): Promise<boolean> {
    const prev = await DETAILS.findOne(
        { ...getGroupAndNameQuery(group, name), [year]: { $exists: true } },
        { _id: 0, [year]: 1 }
    );
    const diff = getDiff(prev, value ? { [year]: value } : undefined);
    if (!diff) {
        return false;
    }
    const time = Date.now();
    await UPDATES.insert({ group, name, time, ...diff });
    await compact(UPDATES);
    return true;
}

export function getDiff(prevValues?: Amounts | null, values?: Amounts | null): Amounts | null | undefined {
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

export async function renameUpdates(group: Group, name: Name, newName: Name): Promise<boolean> {
    if (name === newName) {
        return false;
    }
    const updated = await UPDATES.update(
        getGroupAndNameQuery(group, name),
        { $set: { name: newName } },
        { multi: true }
    );
    if (!updated) {
        return false;
    }
    await compact(UPDATES);
    return true;
}

export async function renameUpdatesGroup(group: Group, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const updated = await UPDATES.update(getGroupQuery(group), { $set: { group: newGroup } }, { multi: true });
    if (!updated) {
        return false;
    }
    await compact(UPDATES);
    return true;
}

export async function removeUpdates(group: Group, name: Name): Promise<boolean> {
    const removed = await UPDATES.remove(getGroupAndNameQuery(group, name), { multi: true });
    if (!removed) {
        return false;
    }
    await compact(UPDATES);
    return true;
}

export async function removeUpdatesGroup(group: Group): Promise<boolean> {
    const removed = await UPDATES.remove(getGroupQuery(group), { multi: true });
    if (!removed) {
        return false;
    }
    await compact(UPDATES);
    return true;
}

export async function moveUpdates(group: Group, name: Name, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const found = await UPDATES.count(getGroupAndNameQuery(newGroup, name));
    if (found) {
        return false;
    }
    const updated = await UPDATES.update(
        getGroupAndNameQuery(group, name),
        { $set: { group: newGroup } },
        { multi: true }
    );
    if (!updated) {
        return false;
    }
    await compact(UPDATES);
    return true;
}
