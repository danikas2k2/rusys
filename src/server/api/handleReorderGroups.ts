import { debugRequest } from '~/server/api/debug';
import { getGroupsResponse } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { reorderGroups } from '~/server/data/groups';
import { type ApiGroups, type ApiReorderGroups, type ApiRequest, type ApiResponse } from '~/types/api';

export async function handleReorderGroups(
    req: ApiRequest<ApiReorderGroups>,
    res: ApiResponse<ApiGroups>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { groups } = req.body;
    res.json(
        await run(
            () => reorderGroups(groups),
            () => getGroupsResponse()
        )
    );
}
