import { type ApiGroups, type ApiReorderGroups, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getGroupsResponse, reorderGroups } from '~/server/data/groups';

export async function handleReorderGroups(
    req: ApiRequest<ApiReorderGroups>,
    res: ApiResponse<ApiGroups>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { groups } = req.body;
    res.json(await run(() => reorderGroups(groups), getGroupsResponse));
}
