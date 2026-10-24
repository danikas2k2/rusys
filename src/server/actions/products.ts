'use server';

import {
    addProductSchema,
    applyReviewSchema,
    deleteProductSchema,
    moveConsumedToRecycledSchema,
    moveProductSchema,
    productYearIdentitySchema,
    renameProductSchema,
    SchemaError,
    setAmountsSchema,
    setProductExpiryToleranceSchema,
    setProductImageSchema,
    setProductMissingSchema,
    setProductParentSchema,
    setProductRemovingSchema,
    setVariantImageSchema,
    transferAmountsSchema,
    type AddProduct,
    type ApplyReview,
    type DeleteProduct,
    type MoveConsumedToRecycled,
    type MoveProduct,
    type ProductHistory,
    type ProductYearIdentity,
    type RenameProduct,
    type SetAmounts,
    type SetProductExpiryTolerance,
    type SetProductImage,
    type SetProductMissing,
    type SetProductParent,
    type SetProductRemoving,
    type SetVariantImage,
    type TransferAmounts,
} from '~/schema';
import { requireSession } from '~/server/auth/session';
import { getProductHistoryData } from '~/server/data/actionHistory';
import { moveProductOccurrences } from '~/server/data/common';
import { getGroups } from '~/server/data/groups';
import {
    addProduct,
    deleteProduct,
    getProductsWithYears,
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
import { assertSuccess } from '~/server/data/utils';
import { getVariants } from '~/server/data/variants';
import { withinTransaction } from '~/server/db';

async function requireStockAuthor(): Promise<string> {
    const { email } = await requireSession();
    if (!email?.trim()) {
        throw new Error(SchemaError.Unauthorized);
    }
    return email;
}

export async function getProductsAction() {
    await requireSession();
    return withinTransaction(async (session) => {
        const data = await getProductsWithYears(session);
        const groups = await getGroups(session);
        const variants = await getVariants(session);
        return { ...data, groups, variants };
    });
}

export async function addProductAction(request: AddProduct): Promise<void> {
    await requireSession();
    const parsed = addProductSchema.parse(request);
    return withinTransaction((session) => addProduct(parsed, session)).then(assertSuccess);
}

export async function deleteProductAction(request: DeleteProduct): Promise<void> {
    await requireSession();
    const parsed = deleteProductSchema.parse(request);
    return withinTransaction((session) => deleteProduct(parsed, session)).then(assertSuccess);
}

export async function renameProductAction(request: RenameProduct): Promise<void> {
    await requireSession();
    const parsed = renameProductSchema.parse(request);
    return withinTransaction((session) => renameProduct(parsed, session)).then(assertSuccess);
}

export async function moveProductAction(request: MoveProduct): Promise<void> {
    await requireSession();
    const parsed = moveProductSchema.parse(request);
    return withinTransaction((session) => moveProductOccurrences(parsed, session)).then(assertSuccess);
}

export async function setProductParentAction(request: SetProductParent): Promise<void> {
    await requireSession();
    const parsed = setProductParentSchema.parse(request);
    return withinTransaction((session) => setProductParent(parsed, session)).then(assertSuccess);
}

export async function setProductExpiryToleranceAction(request: SetProductExpiryTolerance): Promise<void> {
    await requireSession();
    const parsed = setProductExpiryToleranceSchema.parse(request);
    return withinTransaction((session) => setProductExpiryTolerance(parsed, session)).then(assertSuccess);
}

export async function setProductMissingAction(request: SetProductMissing): Promise<void> {
    await requireSession();
    const parsed = setProductMissingSchema.parse(request);
    return withinTransaction((session) => setMissing(parsed, session)).then(assertSuccess);
}

export async function applyReviewAction(request: ApplyReview): Promise<void> {
    await requireSession();
    const parsed = applyReviewSchema.parse(request);
    return withinTransaction((session) => setMissingBulk(parsed, session)).then(assertSuccess);
}

export async function setProductRemovingAction(request: SetProductRemoving): Promise<void> {
    await requireSession();
    const parsed = setProductRemovingSchema.parse(request);
    return withinTransaction((session) => setRemoving(parsed, session)).then(assertSuccess);
}

export async function setProductImageAction(request: SetProductImage): Promise<void> {
    await requireSession();
    const parsed = setProductImageSchema.parse(request);
    return withinTransaction((session) => setImage(parsed, session)).then(assertSuccess);
}

export async function setVariantImageAction(request: SetVariantImage): Promise<void> {
    await requireSession();
    const parsed = setVariantImageSchema.parse(request);
    return withinTransaction((session) => setVariantImage(parsed, session)).then(assertSuccess);
}

export async function setAmountsAction(request: SetAmounts): Promise<void> {
    const user = await requireStockAuthor();
    const parsed = setAmountsSchema.parse(request);
    return withinTransaction((session) => setAmounts(parsed, user, session)).then(assertSuccess);
}

export async function transferAmountsAction(request: TransferAmounts): Promise<void> {
    const user = await requireStockAuthor();
    const parsed = transferAmountsSchema.parse(request);
    return withinTransaction((session) => transferAmounts(parsed, user, session)).then(assertSuccess);
}

export async function moveConsumedToRecycledAction(request: MoveConsumedToRecycled): Promise<void> {
    const user = await requireStockAuthor();
    const parsed = moveConsumedToRecycledSchema.parse(request);
    return withinTransaction((session) => moveConsumedToRecycled(parsed, user, session)).then(assertSuccess);
}

export async function undoProductAction(request: ProductYearIdentity): Promise<void> {
    await requireSession();
    const parsed = productYearIdentitySchema.parse(request);
    return withinTransaction((session) => undoProduct(parsed, session)).then(assertSuccess);
}

export async function redoProductAction(request: ProductYearIdentity): Promise<void> {
    await requireSession();
    const parsed = productYearIdentitySchema.parse(request);
    return withinTransaction((session) => redoProduct(parsed, session)).then(assertSuccess);
}

export async function getProductHistory(request: ProductYearIdentity): Promise<ProductHistory> {
    await requireSession();
    const parsed = productYearIdentitySchema.parse(request);
    return withinTransaction((session) => getProductHistoryData(parsed, session));
}
