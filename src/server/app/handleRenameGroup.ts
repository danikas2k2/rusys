import { type ApiDetails, type ApiRenameGroup, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { renameGroupOccurrences } from '~/server/data/common';
import { getGroupsResponse } from '~/server/data/groups';

export async function handleRenameGroup(req: ApiRequest<ApiRenameGroup>, res: ApiResponse<ApiDetails>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, newGroup } = req.body;
    res.json(await run(() => renameGroupOccurrences(group, newGroup), getGroupsResponse));
}
