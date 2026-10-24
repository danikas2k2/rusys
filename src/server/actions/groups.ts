'use server';

import {
    deleteGroupSchema,
    renameGroupSchema,
    reorderGroupsSchema,
    updateGroupSchema,
    type DeleteGroup,
    type Group,
    type RenameGroup,
    type ReorderGroups,
    type UpdateGroup,
} from '~/schema';
import { requireSession } from '~/server/auth/session';
import { deleteGroup, getGroups, renameGroup, reorderGroups, updateGroup } from '~/server/data/groups';
import { renameProductsGroup } from '~/server/data/products/mutations';
import { assertSuccess } from '~/server/data/utils';
import { renameVariantsGroup } from '~/server/data/variants';
import { withinTransaction } from '~/server/db';

export async function getGroupsAction(): Promise<readonly Group[]> {
    await requireSession();
    return withinTransaction(getGroups);
}

export async function updateGroupAction(request: UpdateGroup): Promise<void> {
    await requireSession();
    const parsed = updateGroupSchema.parse(request);
    return withinTransaction((session) => updateGroup(parsed, session)).then(assertSuccess);
}

export async function renameGroupAction(request: RenameGroup): Promise<void> {
    await requireSession();
    const parsed = renameGroupSchema.parse(request);
    return withinTransaction(async (session) => {
        const { group, targetGroup } = parsed;
        if (group === targetGroup) {
            return updateGroup(parsed, session);
        }
        if (await renameGroup(parsed, session)) {
            await renameVariantsGroup(group, targetGroup, session);
            await renameProductsGroup(group, targetGroup, session);
            return true;
        }
        return false;
    }).then(assertSuccess);
}

export async function deleteGroupAction(request: DeleteGroup): Promise<void> {
    await requireSession();
    const { group } = deleteGroupSchema.parse(request);
    return withinTransaction((session) => deleteGroup(group, session)).then(assertSuccess);
}

export async function reorderGroupsAction(request: ReorderGroups): Promise<void> {
    await requireSession();
    const { groups } = reorderGroupsSchema.parse(request);
    return withinTransaction((session) => reorderGroups(groups, session)).then(assertSuccess);
}
