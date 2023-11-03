import { compact, MISSING } from '~/server/db';
import { type Name } from '~/store/types';

export async function getMissing(): Promise<Name[]> {
    return ((await MISSING.findOne({})) as { missing: [] })?.missing || [];
}

export async function setMissing(missing: Name[]): Promise<Name[]> {
    await MISSING.remove({}, { multi: true });
    await MISSING.insert({ missing });
    await compact(MISSING);
    return getMissing();
}

export async function renameMissing(name: Name, newName: Name): Promise<boolean> {
    const missing = await getMissing();
    const index = missing.indexOf(name);
    if (index >= 0) {
        missing[index] = newName;
        await setMissing(missing);
        return true;
    }
    return false;
}

export async function removeMissing(name: Name): Promise<boolean> {
    const missing = await getMissing();
    const index = missing.indexOf(name);
    if (index >= 0) {
        missing.splice(index, 1);
        await setMissing(missing);
        return true;
    }
    return false;
}
