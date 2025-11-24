import { debugRequest } from '~/server/api/debug';
import { getDetailsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { renameGroupOccurrences } from '~/server/data/common';
import type { ApiDetailsWithYears, ApiRenameGroup, ApiRequest, ApiResponse } from '~/types/api';

export async function handleRenameGroup(
    req: ApiRequest<ApiRenameGroup>,
    res: ApiResponse<ApiDetailsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, newGroup, annual } = req.body;
    res.json(
        await run(
            () => renameGroupOccurrences(group, newGroup, annual),
            () => getDetailsWithGroups()
        )
    );
}
