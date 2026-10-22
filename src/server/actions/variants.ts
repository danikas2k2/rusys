'use server';

import * as schema from '~/schema';
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

export async function updateVariantAction(request: schema.UpdateVariant): Promise<void> {
    await requireSession();
    const parsed = schema.updateVariant.parse(request);
    return withinTransaction((session) => updateVariant(parsed, session)).then(assertSuccess);
}

export async function renameVariantAction(request: schema.RenameVariant): Promise<void> {
    await requireSession();
    const parsed = schema.renameVariant.parse(request);
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

export async function copyVariantAction(request: schema.CopyVariant): Promise<void> {
    await requireSession();
    const parsed = schema.copyVariant.parse(request);
    return withinTransaction((session) => copyVariant(parsed, session)).then(assertSuccess);
}

export async function deleteVariantAction(request: schema.DeleteVariant): Promise<void> {
    await requireSession();
    const { group, variant } = schema.deleteVariant.parse(request);
    return withinTransaction((session) => deleteVariant(group, variant, session)).then(assertSuccess);
}

export async function reorderVariantsAction(request: schema.ReorderVariants): Promise<void> {
    await requireSession();
    const { group, variants } = schema.reorderVariants.parse(request);
    return withinTransaction((session) => reorderVariants(group, variants, session)).then(assertSuccess);
}
