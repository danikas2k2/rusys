import type { UpdateVariant } from '~/common/types';
import {
    deleteDetailsGroup,
    deleteDetailsVariant,
    moveDetails,
    renameDetailsGroup,
    renameDetailsVariant,
} from '~/server/data/details';
import { deleteGroup, renameGroup } from '~/server/data/groups';
import {
    copyDetailsVariants,
    deleteVariant,
    deleteVariantsGroup,
    renameVariant,
    renameVariantsGroup,
} from '~/server/data/variants';
import { withTransaction } from '~/server/db';

export const moveDetailsOccurrences = (
    group: string,
    name: string,
    newGroup: string,
    newName?: string
): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await moveDetails(group, name, newGroup, newName, session)) {
            await copyDetailsVariants(group, newName ?? name, newGroup, session);
            return true;
        }
        return false;
    });

export const renameVariantOccurrences = (
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant
): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await renameVariant(group, variant, newVariant, update, session)) {
            await renameDetailsVariant(group, variant, newVariant, session);
            return true;
        }
        return false;
    });

export const deleteVariantOccurrences = (group: string, variant: string): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await deleteVariant(group, variant, session)) {
            await deleteDetailsVariant(group, variant, session);
            return true;
        }
        return false;
    });

export const renameGroupOccurrences = (group: string, newGroup: string): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await renameGroup(group, newGroup, session)) {
            await renameVariantsGroup(group, newGroup, session);
            await renameDetailsGroup(group, newGroup, session);
            return true;
        }
        return false;
    });

export const deleteGroupOccurrences = (group: string): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await deleteGroup(group, session)) {
            await deleteVariantsGroup(group, session);
            await deleteDetailsGroup(group, session);
            return true;
        }
        return false;
    });
