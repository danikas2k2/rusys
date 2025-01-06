import { removeDetails, renameDetails } from '~/server/data/details';
import { removeMissing, renameMissing } from '~/server/data/missing';
import { removeRemoving, renameRemoving } from '~/server/data/removing';
import { removeUpdates, renameUpdates } from '~/server/data/updates';
import { type Name } from '~/store/types';
import { DETAILS, UPDATES, MISSING, REMOVING } from '~/server/db';

export async function rename(name: Name, newName: Name): Promise<boolean> {
    if (name === newName) {
        return false;
    }
    const updated = await renameDetails(name, newName);
    await renameUpdates(name, newName);
    await renameRemoving(name, newName);
    await renameMissing(name, newName);
    return updated;
}

export async function remove(name: Name): Promise<boolean> {
    const removed = await removeDetails(name);
    await removeUpdates(name);
    await removeRemoving(name);
    await removeMissing(name);
    return removed;
}

export async function getEverything(): Promise<Record<string, any>> {
    return {
        details: await DETAILS.find({}),
        updates: await UPDATES.find({}),
        removing: await REMOVING.find({}),
        missing: await MISSING.find({}),
    };
}
