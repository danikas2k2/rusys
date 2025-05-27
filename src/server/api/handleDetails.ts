import { debugRequest } from '~/server/api/debug';
import { getDetailsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { type ApiDetailsWithGroups, type ApiRequest, type ApiResponse } from '~/types/api';

export async function handleDetails(req: ApiRequest, res: ApiResponse<ApiDetailsWithGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getDetailsWithGroups()));
}
