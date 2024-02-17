import { type ApiResponse, type ApiRequest, type ApiDetails } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getYearsAndDetails } from '~/server/data/details';

export async function handleDetails(req: ApiRequest, res: ApiResponse<ApiDetails>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getYearsAndDetails()));
}
