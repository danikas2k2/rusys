import { type ApiGroups, type ApiRequest, type ApiRequestGroup, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { deleteGroupOccurrences } from '~/server/data/common';
import { getGroupsResponse } from '~/server/data/groups';

export async function handleDeleteGroup(req: ApiRequest<ApiRequestGroup>, res: ApiResponse<ApiGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group } = req.body;
    res.json(await run(() => deleteGroupOccurrences(group), getGroupsResponse));
}
