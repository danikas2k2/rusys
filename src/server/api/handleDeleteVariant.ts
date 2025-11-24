import { debugRequest } from '~/server/api/debug';
import { getProductsWithVariants } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { deleteVariantOccurrences } from '~/server/data/common';
import type { ApiRequest, ApiRequestVariant, ApiResponse, ApiVariants } from '~/types/api';

export async function handleDeleteVariant(
    req: ApiRequest<ApiRequestVariant>,
    res: ApiResponse<ApiVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant } = req.body;
    res.json(
        await run(
            () => deleteVariantOccurrences(group, variant),
            () => getProductsWithVariants()
        )
    );
}
