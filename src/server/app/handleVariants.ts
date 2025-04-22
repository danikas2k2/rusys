import { type ApiRequest, type ApiResponse, type ApiVariantsWithGroups } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getFullVariants } from '~/server/data/variants';

export async function handleVariants(req: ApiRequest, res: ApiResponse<ApiVariantsWithGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(await run(() => getFullVariants()));
}
