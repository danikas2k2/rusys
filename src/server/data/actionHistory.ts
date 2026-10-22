import type { ClientSession } from 'mongodb';

import type { ProductHistory } from '~/common/data';
import type * as schema from '~/schema';
import { getProductUndates, getProductUpdates } from '~/server/data/products';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';

export async function getProductHistoryData(
    request: schema.ProductYearIdentity,
    session: ClientSession
): Promise<ProductHistory> {
    const [updates, undates] = await Promise.all([
        getProductUpdates(request, session),
        getProductUndates(request, session),
    ]);
    return { updates, undates };
}

export async function getSummaryHistoryData(
    request: schema.ProductYearIdentity,
    session: ClientSession
): Promise<ProductHistory> {
    const [updates, undates] = await Promise.all([
        getSummaryUpdates(request, session),
        getSummaryUndates(request, session),
    ]);
    return { updates, undates };
}
