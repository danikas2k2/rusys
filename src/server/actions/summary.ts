'use server';

import type { ProductHistory } from '~/common';
import * as schema from '~/schema';
import { requireSession } from '~/server/auth/session';
import { getSummaryHistoryData } from '~/server/data/actionHistory';
import { getFullSummary } from '~/server/data/summary';
import { withinTransaction } from '~/server/db';

export async function readSummary() {
    await requireSession();
    return withinTransaction(getFullSummary);
}

export async function getSummaryHistory(request: schema.ProductYearIdentity): Promise<ProductHistory> {
    await requireSession();
    const parsed = schema.productYearIdentity.parse(request);
    return withinTransaction((session) => getSummaryHistoryData(parsed, session));
}
