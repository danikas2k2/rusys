import { addUpdate, addUpdates } from '~/server/data/updates';
import { getGroupAndNameQuery, getGroupQuery, getNamedMap } from '~/server/data/utils';
import { compact, DETAILS } from '~/server/db';
import { type Amount, type Amounts, type AmountSet } from '~/state/details/types';
import { type Group, type Name, type Year } from '~/state/types';

export async function getDetails(years: Year[]): Promise<AmountSet> {
    return getNamedMap(
        await DETAILS.find({}, { _id: 0, group: 1, name: 1, ...Object.fromEntries(years.map((y) => [y, 1])) }).sort({
            group: 1,
            name: 1,
        })
    );
}

export async function setDetails(
    group: Group,
    name: Name,
    values?: Amounts,
    updateWithoutHistory = false
): Promise<boolean> {
    if (!updateWithoutHistory) {
        await addUpdates(group, name, values);
    }
    const updated = await DETAILS.update(
        getGroupAndNameQuery(group, name),
        { group, name, ...values },
        { upsert: true }
    );
    if (!updated) {
        return false;
    }
    await compact(DETAILS);
    return true;
}

export async function updateDetails(
    group: Group,
    name: Name,
    year?: Year,
    value?: Amount,
    updateWithoutHistory = false
): Promise<boolean> {
    if (year && !updateWithoutHistory) {
        await addUpdate(group, name, year, value);
    }
    const updated = await DETAILS.update(
        getGroupAndNameQuery(group, name),
        year ? { [Object.keys(value || {}).length ? '$set' : '$unset']: { [year]: value || {} } } : { group, name },
        { upsert: true }
    );
    if (!updated) {
        return false;
    }
    await compact(DETAILS);
    return true;
}

export async function renameDetails(group: Group, name: Name, newName: Name): Promise<boolean> {
    if (name === newName) {
        return false;
    }
    const found = await DETAILS.count(getGroupAndNameQuery(group, newName));
    if (found) {
        return false;
    }
    const updated = await DETAILS.update(
        getGroupAndNameQuery(group, name),
        { $set: { name: newName } },
        { multi: true }
    );
    if (!updated) {
        return false;
    }
    await compact(DETAILS);
    return true;
}

export async function renameDetailsGroup(group: Group, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const found = await DETAILS.count(getGroupQuery(newGroup));
    if (found) {
        return false;
    }
    const updated = await DETAILS.update(getGroupQuery(group), { $set: { group: newGroup } }, { multi: true });
    if (!updated) {
        return false;
    }
    await compact(DETAILS);
    return true;
}

export async function removeDetails(group: Group, name: Name): Promise<boolean> {
    const removed = await DETAILS.remove(getGroupAndNameQuery(group, name), { multi: true });
    if (!removed) {
        return false;
    }
    await compact(DETAILS);
    return true;
}

export async function removeDetailsGroup(group: Group): Promise<boolean> {
    const removed = await DETAILS.remove(getGroupQuery(group), { multi: true });
    if (!removed) {
        return false;
    }
    await compact(DETAILS);
    return true;
}

export async function moveDetails(group: Group, name: Name, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const found = await DETAILS.count(getGroupAndNameQuery(newGroup, name));
    if (found) {
        return false;
    }
    const updated = await DETAILS.update(
        getGroupAndNameQuery(group, name),
        { $set: { group: newGroup } },
        { multi: true }
    );
    if (!updated) {
        return false;
    }
    await compact(DETAILS);
    return true;
}
