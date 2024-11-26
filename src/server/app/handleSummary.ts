import { type ApiGroups, type ApiRequest, type ApiResponse, type ApiSummary, type ApiVariants } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getFullSummary } from '~/server/data/updates';

export async function handleSummary(
    req: ApiRequest,
    res: ApiResponse<ApiSummary & ApiVariants & ApiGroups>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(getFullSummary));
}
