import { type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';

export async function handleExport(req: ApiRequest, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => {}));
}
