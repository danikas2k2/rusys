import { type ApiRequest, type ApiResponse, type ApiUpdateGroup } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { updateGroup } from '~/server/data/groups';

export async function handleUpdateGroup(req: ApiRequest<ApiUpdateGroup>, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, order } = req.body;
    res.json(await run(() => updateGroup(group, order)));
}
