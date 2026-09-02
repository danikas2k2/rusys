import type { ApiRequest, ApiResponse, ApiVariantsWithGroups } from '~/common/api';
import { debugRequest } from '~/server/api/debug';
import { getVariantsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';

export async function handleVariants(req: ApiRequest, res: ApiResponse<ApiVariantsWithGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getVariantsWithGroups()));
}
