import type { ClientSession } from 'mongodb';

import type { MoveProduct, RenameGroup, RenameVariant } from '~/schema';
import { deleteGroup, renameGroup } from '~/server/data/groups';
import { getProductVariants, moveProduct, renameProductsGroup, renameProductsVariant } from '~/server/data/products';
import { copyVariants, deleteVariant, renameVariant, renameVariantsGroup } from '~/server/data/variants';

export async function moveProductOccurrences(request: MoveProduct, session: ClientSession): Promise<boolean> {
    if (!(await moveProduct(request, session))) {
        return false;
    }
    const variants = await getProductVariants(request.targetGroup, request.targetName ?? request.name, session);
    if (variants?.length) {
        await copyVariants(request.group, request.targetGroup, variants, session);
    }
    return true;
}

export async function renameVariantOccurrences(request: RenameVariant, session: ClientSession): Promise<boolean> {
    if (!(await renameVariant(request, session))) {
        return false;
    }
    await renameProductsVariant(request.group, request.variant, request.targetVariant, session);
    return true;
}

export const deleteVariantOccurrences = (group: string, variant: string, session: ClientSession): Promise<boolean> =>
    deleteVariant(group, variant, session);

export const deleteGroupOccurrences = (group: string, session: ClientSession): Promise<boolean> =>
    deleteGroup(group, session);

export async function renameGroupOccurrences(request: RenameGroup, session: ClientSession): Promise<boolean> {
    if (!(await renameGroup(request, session))) {
        return false;
    }
    await renameVariantsGroup(request.group, request.targetGroup, session);
    await renameProductsGroup(request.group, request.targetGroup, session);
    return true;
}
