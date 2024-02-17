import { type ApiRequest, type ApiResponse, type ApiSetMissing } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { setMissing } from '~/server/data/details';

export async function handleSetMissing(req: ApiRequest<ApiSetMissing>, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, missing } = req.body;
    res.json(await run(() => setMissing(group, name, missing)));
}
