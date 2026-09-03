import type { ApiCopyVariant, ApiProductsWithVariants, ApiRequest, ApiResponse } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { getProductsWithVariants } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { copyVariant } from '~/server/data/variants';

export async function handleCopyVariant(
    req: ApiRequest<ApiCopyVariant>,
    res: ApiResponse<ApiProductsWithVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant, newGroup, newVariant, ...update } = req.body;
    res.json(
        await run(
            () => copyVariant(group, variant, newGroup, newVariant, update),
            () => getProductsWithVariants()
        )
    );
}
