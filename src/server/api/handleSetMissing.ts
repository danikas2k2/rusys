import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { setMissing } from '~/server/data/products';
import type { ApiRequest, ApiResponse, ApiSetMissing } from '~/types/api';

export async function handleSetMissing(req: ApiRequest<ApiSetMissing>, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, missing } = req.body;
    res.json(await run(() => setMissing(group, name, missing)));
}
