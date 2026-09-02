import type { ApiGroups, ApiRequest, ApiResponse, ApiUpdateGroup } from '~/common/api';
import { debugRequest } from '~/server/api/debug';
import { getGroupsResponse } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { updateGroup } from '~/server/data/groups';

export async function handleUpdateGroup(req: ApiRequest<ApiUpdateGroup>, res: ApiResponse<ApiGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, annual, review, image } = req.body;
    res.json(
        await run(
            () => updateGroup(group, annual, review, image),
            () => getGroupsResponse()
        )
    );
}
