import { compact, MISSING } from '~/server/db';
import { type NameWithGroup } from '~/state/details/types';
import { type Missing } from '~/state/missing/types';
import { type Group, type Name } from '~/state/types';

// TODO refactor db structure to store missing state inside the details document

const mapMissing = (missing: Name | NameWithGroup): NameWithGroup =>
    typeof missing === 'string' ? { name: missing, group: '' } : missing;

const compareMissing = (a: NameWithGroup, b: NameWithGroup): number =>
    a.group?.localeCompare(b?.group ?? '') || a.name.localeCompare(b.name);

export async function getMissing(): Promise<Missing> {
    return ((await MISSING.findOne({}))?.missing || []).map(mapMissing).sort(compareMissing);
}

export async function setMissing(missing: (Name | NameWithGroup)[]): Promise<boolean> {
    const updated =
        (await MISSING.remove({}, { multi: true })) &&
        (await MISSING.insert({ missing: missing.map(mapMissing).sort(compareMissing) }));
    if (!updated) {
        return false;
    }
    await compact(MISSING);
    return true;
}

const matchGroup = (value: NameWithGroup, group: Group): boolean => (group ? value.group === group : !value.group);

export async function renameMissing(group: Group, name: Name, newName: Name): Promise<boolean> {
    if (name === newName) {
        return false;
    }
    const missing = await getMissing();
    const index = missing.findIndex((value) => matchGroup(value, group) && value.name === name);
    if (index < 0) {
        return false;
    }
    missing[index] = { group, name: newName };
    await setMissing(missing);
    return true;
}

export async function renameMissingGroup(group: Group, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const missing = await getMissing();
    let updated = false;
    for (const value of missing) {
        if (matchGroup(value, group)) {
            value.group = newGroup;
            updated = true;
        }
    }
    if (!updated) {
        return false;
    }
    await setMissing(missing);
    return true;
}

export async function removeMissing(group: Group, name: Name): Promise<boolean> {
    const missing = await getMissing();
    const index = missing.findIndex((value) => matchGroup(value, group) && value.name === name);
    if (index < 0) {
        return false;
    }
    missing.splice(index, 1);
    await setMissing(missing);
    return true;
}

export async function removeMissingGroup(group: Group): Promise<boolean> {
    const missing = await getMissing();
    const updated = missing.filter((value) => !matchGroup(value, group));
    if (updated.length === missing.length) {
        return false;
    }
    await setMissing(updated);
    return true;
}

export async function moveMissing(group: Group, name: Name, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const missing = await getMissing();
    const found = missing.some((value) => matchGroup(value, newGroup) && value.name === name);
    if (found) {
        return false;
    }
    const index = missing.findIndex((value) => matchGroup(value, group) && value.name === name);
    if (index < 0) {
        return false;
    }
    missing[index] = { group: newGroup, name };
    await setMissing(missing);
    return true;
}
