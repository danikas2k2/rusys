import { type ApiRequest, type ApiResponse, type ApiSetRemoving } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { setRemoving } from '~/server/data/details';

export async function handleSetRemoving(req: ApiRequest<ApiSetRemoving>, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year, removing } = req.body;
    res.json(await run(() => setRemoving(group, name, year, removing)));
}
