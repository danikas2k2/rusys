import { debugRequest } from '~/server/api/debug';
import { getGroupsResponse } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { type ApiGroups, type ApiRequest, type ApiResponse } from '~/types/api';

export async function handleGroups(req: ApiRequest, res: ApiResponse<ApiGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getGroupsResponse()));
}
