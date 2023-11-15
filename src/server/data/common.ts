import {
    moveDetails,
    removeDetails,
    removeDetailsGroup,
    renameDetails,
    renameDetailsGroup,
} from '~/server/data/details';
import {
    moveMissing,
    removeMissing,
    removeMissingGroup,
    renameMissing,
    renameMissingGroup,
} from '~/server/data/missing';
import {
    moveRemoving,
    removeRemoving,
    removeRemovingGroup,
    renameRemoving,
    renameRemovingGroup,
} from '~/server/data/removing';
import {
    moveUpdates,
    removeUpdates,
    removeUpdatesGroup,
    renameUpdates,
    renameUpdatesGroup,
} from '~/server/data/updates';
import { type Group, type Name } from '~/state/types';

export async function rename(group: Group, name: Name, newName: Name): Promise<boolean> {
    if (name === newName) {
        return false;
    }
    const updated = await renameDetails(group, name, newName);
    if (updated) {
        await renameUpdates(group, name, newName);
        await renameRemoving(group, name, newName);
        await renameMissing(group, name, newName);
    }
    return updated;
}

export async function renameGroup(group: Group, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const updated = await renameDetailsGroup(group, newGroup);
    if (updated) {
        await renameUpdatesGroup(group, newGroup);
        await renameRemovingGroup(group, newGroup);
        await renameMissingGroup(group, newGroup);
    }
    return updated;
}

export async function remove(group: Group, name: Name): Promise<boolean> {
    const removed = await removeDetails(group, name);
    if (removed) {
        await removeUpdates(group, name);
        await removeRemoving(group, name);
        await removeMissing(group, name);
    }
    return removed;
}

export async function removeGroup(group: Group): Promise<boolean> {
    const removed = await removeDetailsGroup(group);
    if (removed) {
        await removeUpdatesGroup(group);
        await removeRemovingGroup(group);
        await removeMissingGroup(group);
    }
    return removed;
}

export async function move(group: Group, name: Name, newGroup: Group): Promise<boolean> {
    if (group === newGroup) {
        return false;
    }
    const updated = await moveDetails(group, name, newGroup);
    if (updated) {
        await moveUpdates(group, name, newGroup);
        await moveRemoving(group, name, newGroup);
        await moveMissing(group, name, newGroup);
    }
    return updated;
}
