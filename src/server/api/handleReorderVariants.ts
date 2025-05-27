import { debugRequest } from '~/server/api/debug';
import { getVariantsResponse } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { reorderVariants } from '~/server/data/variants';
import { type ApiReorderVariants, type ApiRequest, type ApiResponse, type ApiVariants } from '~/types/api';

export async function handleReorderVariants(
    req: ApiRequest<ApiReorderVariants>,
    res: ApiResponse<ApiVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variants } = req.body;
    res.json(
        await run(
            () => reorderVariants(group, variants),
            () => getVariantsResponse()
        )
    );
}
