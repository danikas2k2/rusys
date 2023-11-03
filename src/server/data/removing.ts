import { getNamedMap } from '~/server/data/utils';
import { getYears } from '~/server/data/years';
import { compact, REMOVING } from '~/server/db';
import { type NamedRemoving, type RemovingSet } from '~/store/removing/types';
import { type Name, type Year } from '~/store/types';

export async function getRemoving(years: Year[]): Promise<RemovingSet> {
    return getNamedMap(
        await REMOVING.find<NamedRemoving>(
            { $or: years.map((y) => ({ [y]: { $exists: true } })) },
            { _id: 0, name: 1, ...Object.fromEntries(years.map((y) => [y, 1])) }
        ).sort({ name: 1 })
    );
}

export async function setRemoving(name: Name, year: Year, removing: boolean): Promise<RemovingSet> {
    await REMOVING.update({ name }, { [removing ? '$set' : '$unset']: { [year]: true } }, { upsert: true });
    await compact(REMOVING);
    return getRemoving(getYears());
}

export async function renameRemoving(name: Name, newName: Name): Promise<boolean> {
    const updated = await REMOVING.update({ name }, { $set: { name: newName } }, { multi: true });
    if (updated) {
        await compact(REMOVING);
        return true;
    }
    return false;
}

export async function removeRemoving(name: Name): Promise<boolean> {
    const removed = await REMOVING.remove({ name }, { multi: true });
    if (removed) {
        await compact(REMOVING);
        return true;
    }
    return false;
}
