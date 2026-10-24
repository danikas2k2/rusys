'use server';

import { productYearIdentitySchema, type ProductHistory, type ProductYearIdentity } from '~/schema';
import { requireSession } from '~/server/auth/session';
import { getSummaryHistoryData } from '~/server/data/actionHistory';
import { getFullSummary } from '~/server/data/summary';
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
