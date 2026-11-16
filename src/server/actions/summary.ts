'use server';

import {
    productIdentitySchema,
    productYearIdentitySchema,
    type ProductHistory,
    type ProductIdentity,
    type ProductYearIdentity,
} from '~/schema';
import { requireSession } from '~/server/auth/session';
import { getSummaryHistoryData } from '~/server/data/actionHistory';
import { getFullSummary, getProductConsumptionYears, getProductSummaryAmounts } from '~/server/data/summary';
import { withinTransaction } from '~/server/db';

export async function readSummary() {
    await requireSession();
    return withinTransaction(getFullSummary);
}

export async function getSummaryHistory(request: ProductYearIdentity): Promise<ProductHistory> {
    await requireSession();
    const parsed = productYearIdentitySchema.parse(request);
    return withinTransaction((session) => getSummaryHistoryData(parsed, session));
}

export async function readProductSummary(request: ProductYearIdentity) {
    await requireSession();
    const parsed = productYearIdentitySchema.parse(request);
    return withinTransaction((session) => getProductSummaryAmounts(parsed, session));
}

export async function readProductConsumptionYears(request: ProductIdentity) {
    await requireSession();
    const parsed = productIdentitySchema.parse(request);
    return withinTransaction((session) => getProductConsumptionYears(parsed, session));
}
