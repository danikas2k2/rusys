'use server';

import {
    copyVariantSchema,
    deleteVariantSchema,
    renameVariantSchema,
    reorderVariantsSchema,
    updateVariantSchema,
    type CopyVariant,
    type DeleteVariant,
    type RenameVariant,
    type ReorderVariants,
    type UpdateVariant,
} from '~/schema';
import { requireSession } from '~/server/auth/session';
import { getGroups } from '~/server/data/groups';
import { renameProductsVariant } from '~/server/data/products/mutations';
import { assertSuccess } from '~/server/data/utils';
import {
    copyVariant,
    deleteVariant,
    getVariants,
    renameVariant,
    reorderVariants,
    updateVariant,
} from '~/server/data/variants';
import { withinTransaction } from '~/server/db';

export async function getVariantsAction() {
    await requireSession();
    return withinTransaction(async (session) => {
        const groups = await getGroups(session);
        const variants = await getVariants(session);
        return { groups, variants };
    });
}

export async function updateVariantAction(request: UpdateVariant): Promise<void> {
    await requireSession();
    const parsed = updateVariantSchema.parse(request);
    return withinTransaction((session) => updateVariant(parsed, session)).then(assertSuccess);
}

export async function renameVariantAction(request: RenameVariant): Promise<void> {
    await requireSession();
    const parsed = renameVariantSchema.parse(request);
    return withinTransaction(async (session) => {
        const { group, variant, targetVariant } = parsed;
        if (variant === targetVariant) {
            return updateVariant(parsed, session);
        }
        if (await renameVariant(parsed, session)) {
            await renameProductsVariant(group, variant, targetVariant, session);
            return true;
        }
        return false;
    }).then(assertSuccess);
}

export async function copyVariantAction(request: CopyVariant): Promise<void> {
    await requireSession();
    const parsed = copyVariantSchema.parse(request);
    return withinTransaction((session) => copyVariant(parsed, session)).then(assertSuccess);
}

export async function deleteVariantAction(request: DeleteVariant): Promise<void> {
    await requireSession();
    const { group, variant } = deleteVariantSchema.parse(request);
    return withinTransaction((session) => deleteVariant(group, variant, session)).then(assertSuccess);
}

export async function reorderVariantsAction(request: ReorderVariants): Promise<void> {
    await requireSession();
    const { group, variants } = reorderVariantsSchema.parse(request);
    return withinTransaction((session) => reorderVariants(group, variants, session)).then(assertSuccess);
}
