import {
    deleteDetailsGroup,
    deleteDetailsVariant,
    renameDetailsGroup,
    renameDetailsVariant,
} from '~/server/data/details';
import { deleteGroup, renameGroup } from '~/server/data/groups';
import { deleteVariant, deleteVariantsGroup, renameVariant, renameVariantsGroup } from '~/server/data/variants';
import { withTransaction } from '~/server/db';

export const renameVariantOccurrences = (group: string, variant: string, newVariant: string): Promise<boolean> =>
    withTransaction(
        async (session) =>
            (await renameVariant(group, variant, newVariant, session)) &&
            (await renameDetailsVariant(group, variant, newVariant, session))
    );

export const deleteVariantOccurrences = (group: string, variant: string): Promise<boolean> =>
    withTransaction(
        async (session) =>
            (await deleteVariant(group, variant, session)) && (await deleteDetailsVariant(group, variant, session))
    );

export const renameGroupOccurrences = (group: string, newGroup: string): Promise<boolean> =>
    withTransaction(
        async (session) =>
            (await renameGroup(group, newGroup, session)) &&
            (await renameVariantsGroup(group, newGroup, session)) &&
            (await renameDetailsGroup(group, newGroup, session))
    );

export const deleteGroupOccurrences = (group: string): Promise<boolean> =>
    withTransaction(
        async (session) =>
            (await deleteGroup(group, session)) &&
            (await deleteVariantsGroup(group, session)) &&
            (await deleteDetailsGroup(group, session))
    );
