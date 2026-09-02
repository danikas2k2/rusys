import type { ApiAllSummary, ApiRequest, ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { getFullSummary } from '~/server/data/summary';

export async function handleSummary(req: ApiRequest, res: ApiResponse<ApiAllSummary>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getFullSummary()));
}
