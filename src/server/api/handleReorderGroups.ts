import type { ApiGroups, ApiReorderGroups, ApiRequest, ApiResponse } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { getGroupsResponse } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { reorderGroups } from '~/server/data/groups';

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
