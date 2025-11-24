import { debugRequest } from '~/server/api/debug';
import { getProductsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import type { ApiProductsWithGroups, ApiRequest, ApiResponse } from '~/types/api';

export async function handleProducts(req: ApiRequest, res: ApiResponse<ApiProductsWithGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getProductsWithGroups()));
}
