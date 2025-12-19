import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { updateProductsHistoryEntry } from '~/server/data/productsHistory';
import type { ApiRequest, ApiResponse, ApiUpdateProductsHistoryEntry } from '~/types/api';

export async function handleUpdateProductsHistory(
    req: ApiRequest<ApiUpdateProductsHistoryEntry>,
    res: ApiResponse
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, time, year, amounts, user } = req.body;
    res.json(await run(() => updateProductsHistoryEntry(group, name, time, year, amounts, user)));
}


