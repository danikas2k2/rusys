import { debugRequest } from '~/server/api/debug';
import { getVariantsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import type { ApiRequest, ApiResponse, ApiVariantsWithGroups } from '~/types/api';

export async function handleVariants(req: ApiRequest, res: ApiResponse<ApiVariantsWithGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getVariantsWithGroups()));
}
