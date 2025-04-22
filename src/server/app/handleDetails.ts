import { type ApiAllDetails, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getAllDetails } from '~/server/data/details';

export async function handleDetails(req: ApiRequest, res: ApiResponse<ApiAllDetails>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getAllDetails()));
}
