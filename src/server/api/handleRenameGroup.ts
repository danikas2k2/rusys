import { debugRequest } from '~/server/api/debug';
import { getDetailsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { renameGroupOccurrences } from '~/server/data/common';
import { type ApiDetailsWithYears, type ApiRenameGroup, type ApiRequest, type ApiResponse } from '~/types/api';

export async function handleRenameGroup(
    req: ApiRequest<ApiRenameGroup>,
    res: ApiResponse<ApiDetailsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, newGroup } = req.body;
    res.json(
        await run(
            () => renameGroupOccurrences(group, newGroup),
            () => getDetailsWithGroups()
        )
    );
}
