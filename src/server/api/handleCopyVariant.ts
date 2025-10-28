import { debugRequest } from '~/server/api/debug';
import { getDetailsWithVariants } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { copyVariant } from '~/server/data/variants';
import type { ApiCopyVariant, ApiDetailsWithVariants, ApiRequest, ApiResponse } from '~/types/api';

export async function handleCopyVariant(
    req: ApiRequest<ApiCopyVariant>,
    res: ApiResponse<ApiDetailsWithVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant, newGroup, newVariant, ...update } = req.body;
    res.json(
        await run(
            () => copyVariant(group, variant, newGroup, newVariant, update),
            () => getDetailsWithVariants()
        )
    );
}
