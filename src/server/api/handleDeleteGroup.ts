import { debugRequest } from '~/server/api/debug';
import { getDetailsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { deleteGroupOccurrences } from '~/server/data/common';
import { type ApiGroups, type ApiRequest, type ApiRequestGroup, type ApiResponse } from '~/types/api';

export async function handleDeleteGroup(req: ApiRequest<ApiRequestGroup>, res: ApiResponse<ApiGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group } = req.body;
    res.json(
        await run(
            () => deleteGroupOccurrences(group),
            () => getDetailsWithGroups()
        )
    );
}
