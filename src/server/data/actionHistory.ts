import type { ClientSession } from 'mongodb';

import type { ProductHistory, ProductYearIdentity } from '~/schema';
import { getProductUndates, getProductUpdates } from '~/server/data/products';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';

export async function getProductHistoryData(
    request: ProductYearIdentity,
    session: ClientSession
): Promise<ProductHistory> {
    const updates = await getProductUpdates(request, session);
    const undates = await getProductUndates(request, session);
    return { updates, undates };
}

export async function getSummaryHistoryData(
    request: ProductYearIdentity,
    session: ClientSession
): Promise<ProductHistory> {
    const updates = await getSummaryUpdates(request, session);
    const undates = await getSummaryUndates(request, session);
    return { updates, undates };
}
