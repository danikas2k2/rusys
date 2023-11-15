import { getGroupAndNameQuery, getGroupQuery, getNamedMap } from '~/server/data/utils';
import { compact, REMOVING } from '~/server/db';
import { type RemovingSet } from '~/state/removing/types';
import { type Group, type Name, type Year } from '~/state/types';

export async function getRemoving(years: Year[]): Promise<RemovingSet> {
    return getNamedMap(
        await REMOVING.find(
            { $or: years.map((y) => ({ [y]: { $exists: true } })) },
            { _id: 0, group: 1, name: 1, ...Object.fromEntries(years.map((y) => [y, 1])) }
        ).sort({ group: 1, name: 1 })
    );
}

export async function setRemoving(group: Group, name: Name, year: Year, removing: boolean): Promise<boolean> {
    const updated = await REMOVING.update(
        { ...getGroupAndNameQuery(group, name), [year]: { $exists: !removing } },
        { [removing ? '$set' : '$unset']: { [year]: true } },
        { upsert: removing }
    );
    if (!updated) {
        return false;
    }
    await compact(REMOVING);
    return true;
}

export async function renameRemoving(group: Group, name: Name, newName: Name): Promise<boolean> {
    if (name === newName) {
        return false;
    }
    const updated = await REMOVING.update(
        getGroupAndNameQuery(group, name),
        { $set: { name: newName } },
        { multi: true }
    );
    if (!updated) {
        return false;
    }
    await compact(REMOVING);
    return true;
}

export async function renameRemovingGroup(group: Group, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const updated = await REMOVING.update(getGroupQuery(group), { $set: { group: newGroup } }, { multi: true });
    if (!updated) {
        return false;
    }
    await compact(REMOVING);
    return true;
}

export async function removeRemoving(group: Group, name: Name): Promise<boolean> {
    const removed = await REMOVING.remove(getGroupAndNameQuery(group, name), { multi: true });
    if (!removed) {
        return false;
    }
    await compact(REMOVING);
    return true;
}

export async function removeRemovingGroup(group: Group): Promise<boolean> {
    const removed = await REMOVING.remove(getGroupQuery(group), { multi: true });
    if (!removed) {
        return false;
    }
    await compact(REMOVING);
    return true;
}

export async function moveRemoving(group: Group, name: Name, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const found = await REMOVING.count(getGroupAndNameQuery(newGroup, name));
    if (found) {
        return false;
    }
    const updated = await REMOVING.update(
        getGroupAndNameQuery(group, name),
        { $set: { group: newGroup } },
        { multi: true }
    );
    if (!updated) {
        return false;
    }
    await compact(REMOVING);
    return true;
}
