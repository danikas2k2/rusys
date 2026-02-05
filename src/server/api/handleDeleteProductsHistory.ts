import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { deleteProductsHistoryEntry } from '~/server/data/history';
import type { ApiDeleteProductsHistoryEntry, ApiRequest, ApiResponse } from '~/types/api';

export async function handleDeleteProductsHistory(
    req: ApiRequest<ApiDeleteProductsHistoryEntry>,
    res: ApiResponse
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, time, year } = req.body;
    res.json(await run(() => deleteProductsHistoryEntry(group, name, time, year)));
}
