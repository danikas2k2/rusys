'use server';

import type { UpdateVariant } from '~/common/data';
import { isOrderMap, isRequiredString, isUpdateVariant } from '~/server/actions/validation';
import { requireSession } from '~/server/auth/session';
import { renameVariantOccurrences } from '~/server/data/common';
import { getGroups } from '~/server/data/groups';
import {
    copyVariant,
    deleteVariant,
    getVariant,
    getVariants,
    reorderVariants,
    updateVariant,
} from '~/server/data/variants';

export async function getVariantsAction() {
    await requireSession();
    const [groups, variants] = await Promise.all([getGroups(), getVariants()]);
    return { groups, variants };
}

export async function saveVariant(group: string, variant: string, update: UpdateVariant): Promise<void> {
    await requireSession();
    if (!isRequiredString(group) || !isRequiredString(variant) || !isUpdateVariant(update)) {
        throw new Error('Invalid variant update');
    }
    const current = await getVariant(group, variant);
    const next = {
        order: update.order ?? current?.order,
        suffix: update.suffix ?? current?.suffix,
        count: update.count ?? current?.count,
        units: update.units ?? current?.units,
    };
    if (!(await updateVariant(group, variant, next))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function renameVariantAction(
    group: string,
    variant: string,
    name: string,
    update: UpdateVariant = {}
): Promise<void> {
    await requireSession();
    if (!isRequiredString(group) || !isRequiredString(variant) || !isRequiredString(name) || !isUpdateVariant(update)) {
        throw new Error('Invalid variant update');
    }
    const current = await getVariant(group, variant);
    if (!current) {
        throw new Error('Variant not found');
    }
    const next = {
        order: update.order ?? current.order,
        suffix: update.suffix ?? current.suffix,
        count: update.count ?? current.count,
        units: update.units ?? current.units,
    };
    if (!(await renameVariantOccurrences(group, variant, name, next))) {
        throw new Error('The variant could not be renamed');
    }
}

export async function copyVariantAction(
    group: string,
    variant: string,
    newGroup: string,
    newVariant?: string,
    update: UpdateVariant = {}
): Promise<void> {
    await requireSession();
    if (
        !isRequiredString(group) ||
        !isRequiredString(variant) ||
        !isRequiredString(newGroup) ||
        (newVariant !== undefined && !isRequiredString(newVariant)) ||
        !isUpdateVariant(update)
    ) {
        throw new Error('Invalid variant update');
    }
    if (!(await copyVariant(group, variant, newGroup, newVariant, update))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function deleteVariantAction(group: string, variant: string): Promise<void> {
    await requireSession();
    if (!isRequiredString(group) || !isRequiredString(variant)) {
        throw new Error('Invalid variant update');
    }
    if (!(await deleteVariant(group, variant))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function reorderVariantsAction(group: string, variants: Readonly<Record<string, number>>): Promise<void> {
    await requireSession();
    if (!isRequiredString(group) || !isOrderMap(variants)) {
        throw new Error('Invalid variant update');
    }
    if (!(await reorderVariants(group, variants))) {
        throw new Error('The requested change could not be applied');
    }
}
