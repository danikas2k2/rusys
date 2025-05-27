import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { exportEverything } from '~/server/data/common';
import { type ApiExport, type ApiRequest, type ApiResponse } from '~/types/api';

export async function handleExport(req: ApiRequest, res: ApiResponse<ApiExport>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => exportEverything()));
}
