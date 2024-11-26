import { type ApiDetails, type ApiGroups, type ApiRequest, type ApiResponse, type ApiVariants } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getFullDetails } from '~/server/data/details';

export async function handleDetails(
    req: ApiRequest,
    res: ApiResponse<ApiDetails & ApiVariants & ApiGroups>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(getFullDetails));
}
