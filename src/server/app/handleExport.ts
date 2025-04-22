import { type ApiExport, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { exportEverything } from '~/server/data/common';

export async function handleExport(req: ApiRequest, res: ApiResponse<ApiExport>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => exportEverything()));
}
