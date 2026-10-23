'use server';

import type { ProductHistory } from '~/common/data';
import * as schema from '~/schema';
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
        throw new Error(schema.SchemaError.Unauthorized);
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

export async function addProductAction(request: schema.AddProduct): Promise<void> {
    await requireSession();
    const parsed = schema.addProduct.parse(request);
    return withinTransaction((session) => addProduct(parsed, session)).then(assertSuccess);
}

export async function deleteProductAction(request: schema.DeleteProduct): Promise<void> {
    await requireSession();
    const parsed = schema.deleteProduct.parse(request);
    return withinTransaction((session) => deleteProduct(parsed, session)).then(assertSuccess);
}

export async function renameProductAction(request: schema.RenameProduct): Promise<void> {
    await requireSession();
    const parsed = schema.renameProduct.parse(request);
    return withinTransaction((session) => renameProduct(parsed, session)).then(assertSuccess);
}

export async function moveProductAction(request: schema.MoveProduct): Promise<void> {
    await requireSession();
    const parsed = schema.moveProduct.parse(request);
    return withinTransaction((session) => moveProductOccurrences(parsed, session)).then(assertSuccess);
}

export async function setProductParentAction(request: schema.SetProductParent): Promise<void> {
    await requireSession();
    const parsed = schema.setProductParent.parse(request);
    return withinTransaction((session) => setProductParent(parsed, session)).then(assertSuccess);
}

export async function setProductExpiryToleranceAction(request: schema.SetProductExpiryTolerance): Promise<void> {
    await requireSession();
    const parsed = schema.setProductExpiryTolerance.parse(request);
    return withinTransaction((session) => setProductExpiryTolerance(parsed, session)).then(assertSuccess);
}

export async function setProductMissingAction(request: schema.SetProductMissing): Promise<void> {
    await requireSession();
    const parsed = schema.setProductMissing.parse(request);
    return withinTransaction((session) => setMissing(parsed, session)).then(assertSuccess);
}

export async function applyReviewAction(request: schema.ApplyReview): Promise<void> {
    await requireSession();
    const parsed = schema.applyReview.parse(request);
    return withinTransaction((session) => setMissingBulk(parsed, session)).then(assertSuccess);
}

export async function setProductRemovingAction(request: schema.SetProductRemoving): Promise<void> {
    await requireSession();
    const parsed = schema.setProductRemoving.parse(request);
    return withinTransaction((session) => setRemoving(parsed, session)).then(assertSuccess);
}

export async function setProductImageAction(request: schema.SetProductImage): Promise<void> {
    await requireSession();
    const parsed = schema.setProductImage.parse(request);
    return withinTransaction((session) => setImage(parsed, session)).then(assertSuccess);
}

export async function setVariantImageAction(request: schema.SetVariantImage): Promise<void> {
    await requireSession();
    const parsed = schema.setVariantImage.parse(request);
    return withinTransaction((session) => setVariantImage(parsed, session)).then(assertSuccess);
}

export async function setAmountsAction(request: schema.SetAmounts): Promise<void> {
    const user = await requireStockAuthor();
    const parsed = schema.setAmounts.parse(request);
    return withinTransaction((session) => setAmounts(parsed, user, session)).then(assertSuccess);
}

export async function transferAmountsAction(request: schema.TransferAmounts): Promise<void> {
    const user = await requireStockAuthor();
    const parsed = schema.transferAmounts.parse(request);
    return withinTransaction((session) => transferAmounts(parsed, user, session)).then(assertSuccess);
}

export async function moveConsumedToRecycledAction(request: schema.MoveConsumedToRecycled): Promise<void> {
    const user = await requireStockAuthor();
    const parsed = schema.moveConsumedToRecycled.parse(request);
    return withinTransaction((session) => moveConsumedToRecycled(parsed, user, session)).then(assertSuccess);
}

export async function undoProductAction(request: schema.ProductYearIdentity): Promise<void> {
    await requireSession();
    const parsed = schema.productYearIdentity.parse(request);
    return withinTransaction((session) => undoProduct(parsed, session)).then(assertSuccess);
}

export async function redoProductAction(request: schema.ProductYearIdentity): Promise<void> {
    await requireSession();
    const parsed = schema.productYearIdentity.parse(request);
    return withinTransaction((session) => redoProduct(parsed, session)).then(assertSuccess);
}

export async function getProductHistory(request: schema.ProductYearIdentity): Promise<ProductHistory> {
    await requireSession();
    const parsed = schema.productYearIdentity.parse(request);
    return withinTransaction((session) => getProductHistoryData(parsed, session));
}
