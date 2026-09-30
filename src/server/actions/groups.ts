'use server';

import { type Group } from '~/common';
import { isOptionalBoolean, isOptionalString, isOrderMap, isRequiredString } from '~/server/actions/validation';
import { requireSession } from '~/server/auth/session';
import { deleteGroupOccurrences, renameGroupOccurrences } from '~/server/data/common';
import { getGroup, getGroups, reorderGroups, updateGroup } from '~/server/data/groups';

export async function getGroupsAction(): Promise<readonly Group[]> {
    await requireSession();
    return getGroups();
}

export async function updateGroupAction(
    group: string,
    annual?: boolean,
    review?: boolean,
    image?: string
): Promise<void> {
    await requireSession();
    if (
        !isRequiredString(group) ||
        !isOptionalBoolean(annual) ||
        !isOptionalBoolean(review) ||
        !isOptionalString(image)
    ) {
        throw new Error('Invalid group update');
    }
    if (!(await updateGroup(group, annual, review, image))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function renameGroupAction(
    group: string,
    name: string,
    annual?: boolean,
    review?: boolean,
    image?: string
): Promise<void> {
    await requireSession();
    if (
        !isRequiredString(group) ||
        !isRequiredString(name) ||
        !isOptionalBoolean(annual) ||
        !isOptionalBoolean(review) ||
        !isOptionalString(image)
    ) {
        throw new Error('Invalid group update');
    }
    const current = await getGroup(group);
    if (!current) {
        throw new Error('Group not found');
    }
    if (
        !(await renameGroupOccurrences(
            group,
            name,
            annual ?? current.annual,
            review ?? current.review,
            image ?? current.image
        ))
    ) {
        throw new Error('The requested change could not be applied');
    }
}

export async function deleteGroupAction(group: string): Promise<void> {
    await requireSession();
    if (!isRequiredString(group)) {
        throw new Error('Invalid group update');
    }
    if (!(await deleteGroupOccurrences(group))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function reorderGroupsAction(groups: Readonly<Record<string, number>>): Promise<void> {
    await requireSession();
    if (!isOrderMap(groups)) {
        throw new Error('Invalid group update');
    }
    if (!(await reorderGroups(groups))) {
        throw new Error('The requested change could not be applied');
    }
}
