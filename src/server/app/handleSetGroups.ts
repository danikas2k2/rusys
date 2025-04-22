import { type ApiGroups, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getGroupsResponse, setGroups } from '~/server/data/groups';

export async function handleSetGroups(req: ApiRequest<ApiGroups>, res: ApiResponse<ApiGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { groups } = req.body;
    res.json(
        await run(
            () => setGroups(groups),
            () => getGroupsResponse()
        )
    );
}
