import type { ApiGroups, ApiRequest, ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/api/debug';
import { getGroupsResponse } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';

export async function handleGroups(req: ApiRequest, res: ApiResponse<ApiGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getGroupsResponse()));
}
