import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { setRemoving } from '~/server/data/details';
import { type ApiRequest, type ApiResponse, type ApiSetRemoving } from '~/types/api';

export async function handleSetRemoving(req: ApiRequest<ApiSetRemoving>, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year, removing } = req.body;
    res.json(await run(() => setRemoving(group, name, year, removing)));
}
