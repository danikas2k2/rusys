import { type ApiRequest, type ApiResponse, type ApiSwitchGroups } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { switchGroups } from '~/server/data/groups';

export async function handleSwitchGroups(req: ApiRequest<ApiSwitchGroups>, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, oppositeGroup } = req.body;
    res.json(await run(() => switchGroups(group, oppositeGroup)));
}
