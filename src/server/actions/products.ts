'use server';

import type { ProductHistory, VariantAmount } from '~/common/data';
import {
    isArray,
    isFiniteNumber,
    isMoveFlags,
    isOptionalString,
    isRecord,
    isRequiredBoolean,
    isRequiredString,
    isVariantAmounts,
    isYear,
} from '~/server/actions/validation';
import { requireSession } from '~/server/auth/session';
import { moveProductOccurrences } from '~/server/data/common';
import { getGroups } from '~/server/data/groups';
import {
    addProduct,
    deleteProduct,
    getProductsWithYears,
    getProductUndates,
    getProductUpdates,
    moveConsumedToRecycled,
    redoProduct,
    renameProduct,
    setAmounts,
    setImage,
    setMissing,
    setMissingBulk,
    setProductExpiryTolerance,
    setProductParent,
    setRemoving,
    setVariantImage,
    transferAmounts,
    undoProduct,
} from '~/server/data/products';
import { getVariants } from '~/server/data/variants';

const isProduct = (group: unknown, name: unknown): boolean => isRequiredString(group) && isRequiredString(name);

const isAmountContext = (group: unknown, name: unknown, year: unknown, user: unknown, comment: unknown): boolean =>
    isProduct(group, name) && isYear(year) && isOptionalString(user) && isOptionalString(comment);

export async function getProductsAction() {
    await requireSession();
    const [data, groups, variants] = await Promise.all([getProductsWithYears(), getGroups(), getVariants()]);
    return { ...data, groups, variants };
}

export async function addProductAction(group: string, name: string, parent?: string): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || !isOptionalString(parent)) {
        throw new Error('Invalid product update');
    }
    if (!(await addProduct(group, name, parent))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function deleteProductAction(group: string, name: string): Promise<void> {
    await requireSession();
    if (!isProduct(group, name)) {
        throw new Error('Invalid product update');
    }
    if (!(await deleteProduct(group, name))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function renameProductAction(group: string, name: string, newName: string): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || !isRequiredString(newName)) {
        throw new Error('Invalid product update');
    }
    if (!(await renameProduct(group, name, newName))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function moveProductAction(
    group: string,
    name: string,
    newGroup: string,
    newName?: string
): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || !isRequiredString(newGroup) || !isOptionalString(newName)) {
        throw new Error('Invalid product update');
    }
    if (!(await moveProductOccurrences(group, name, newGroup, newName))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function setProductParentAction(group: string, name: string, parent?: string): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || !isOptionalString(parent)) {
        throw new Error('Invalid product update');
    }
    if (!(await setProductParent(group, name, parent))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function setProductExpiryToleranceAction(group: string, name: string, days: number): Promise<void> {
    await requireSession();
    if (!isProduct(group, name)) {
        throw new Error('Invalid product update');
    }
    if (!Number.isInteger(days) || days < 0) {
        throw new Error('expiryToleranceDays must be a non-negative integer');
    }
    if (!(await setProductExpiryTolerance(group, name, days))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function setProductMissingAction(group: string, name: string, missing: boolean): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || typeof missing !== 'boolean') {
        throw new Error('Invalid product update');
    }
    if (!(await setMissing(group, name, missing))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function applyReviewAction(
    updates: readonly { group: string; name: string; missing: boolean }[]
): Promise<void> {
    await requireSession();
    if (
        !isArray(updates, 1) ||
        updates.some(
            (update: unknown) =>
                !isRecord(update) ||
                !isRequiredString(update.group) ||
                !isRequiredString(update.name) ||
                !isRequiredBoolean(update.missing) ||
                Object.keys(update).some((key) => !['group', 'name', 'missing'].includes(key))
        )
    ) {
        throw new Error('updates must contain group, name, and missing for each product');
    }
    if (!(await setMissingBulk(updates))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function setProductRemovingAction(
    group: string,
    name: string,
    year: number,
    removing: boolean
): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || !isYear(year) || typeof removing !== 'boolean') {
        throw new Error('Invalid product update');
    }
    if (!(await setRemoving(group, name, year, removing))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function setProductImageAction(group: string, name: string, image: string): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || (image !== '' && !isRequiredString(image))) {
        throw new Error('Invalid product update');
    }
    if (!(await setImage(group, name, image))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function setVariantImageAction(
    group: string,
    name: string,
    variant: string,
    image: string
): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || !isRequiredString(variant) || (image !== '' && !isRequiredString(image))) {
        throw new Error('Invalid product update');
    }
    if (!(await setVariantImage(group, name, variant, image))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function setAmountsAction(
    group: string,
    name: string,
    year: number,
    amounts?: readonly VariantAmount[],
    user?: string,
    comment?: string
): Promise<void> {
    await requireSession();
    if (!isAmountContext(group, name, year, user, comment) || !isVariantAmounts(amounts)) {
        throw new Error('Invalid product update');
    }
    if (!(await setAmounts(group, name, year, amounts, user, comment))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function transferAmountsAction(
    group: string,
    name: string,
    year: number,
    targetGroup: string,
    targetName: string,
    amounts: readonly VariantAmount[],
    user?: string,
    comment?: string
): Promise<void> {
    await requireSession();
    if (
        !isAmountContext(group, name, year, user, comment) ||
        !isRequiredString(targetGroup) ||
        !isRequiredString(targetName) ||
        !isVariantAmounts(amounts) ||
        amounts.some(({ amount }) => amount <= 0)
    ) {
        throw new Error('Invalid product update');
    }
    if (!(await transferAmounts(group, name, year, targetGroup, targetName, amounts, user, comment))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function moveConsumedToRecycledAction(
    group: string,
    name: string,
    year: number,
    variant: string,
    amount: number,
    flags: Pick<VariantAmount, 'suspicious' | 'home' | 'expiresAt'> = {},
    user?: string
): Promise<void> {
    await requireSession();
    if (
        !isProduct(group, name) ||
        !isYear(year) ||
        !isRequiredString(variant) ||
        !isFiniteNumber(amount) ||
        amount <= 0 ||
        !isMoveFlags(flags) ||
        !isOptionalString(user)
    ) {
        throw new Error('Invalid product update');
    }
    if (!(await moveConsumedToRecycled(group, name, year, variant, amount, flags, user))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function undoProductAction(group: string, name: string, year: number): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || !isYear(year)) {
        throw new Error('Invalid product update');
    }
    if (!(await undoProduct(group, name, year))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function redoProductAction(group: string, name: string, year: number): Promise<void> {
    await requireSession();
    if (!isProduct(group, name) || !isYear(year)) {
        throw new Error('Invalid product update');
    }
    if (!(await redoProduct(group, name, year))) {
        throw new Error('The requested change could not be applied');
    }
}

export async function getProductHistory(group: string, name: string, year: number): Promise<ProductHistory> {
    await requireSession();
    if (!isRequiredString(group) || !isRequiredString(name) || !isYear(year)) {
        throw new Error('Invalid history selection');
    }
    const [updates, undates] = await Promise.all([
        getProductUpdates(group, name, year),
        getProductUndates(group, name, year),
    ]);
    return { updates, undates };
}
