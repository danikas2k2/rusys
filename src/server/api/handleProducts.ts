import type { ApiProductsWithGroups, ApiRequest, ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/api/debug';
import { getProductsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';

export async function handleProducts(req: ApiRequest, res: ApiResponse<ApiProductsWithGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getProductsWithGroups()));
}
