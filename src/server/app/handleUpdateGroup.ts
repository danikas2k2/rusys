import { type ApiGroups, type ApiRequest, type ApiResponse, type ApiUpdateGroup } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getGroups, updateGroup } from '~/server/data/groups';

export async function handleUpdateGroup(req: ApiRequest<ApiUpdateGroup>, res: ApiResponse<ApiGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, order } = req.body;
    res.json(
        await run(
            () => updateGroup(group, order),
            () => getGroups()
        )
    );
}
