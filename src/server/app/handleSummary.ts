import { type ApiAllSummary, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getFullSummary } from '~/server/data/updates';

export async function handleSummary(req: ApiRequest, res: ApiResponse<ApiAllSummary>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getFullSummary()));
}
