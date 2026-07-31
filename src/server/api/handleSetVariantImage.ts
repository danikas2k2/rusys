import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { setVariantImage } from '~/server/data/products';
import type { ApiProductsWithYears, ApiRequest, ApiResponse, ApiSetVariantImage } from '~/types/api';

export async function handleSetVariantImage(
    req: ApiRequest<ApiSetVariantImage>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, variant, image } = req.body;
    res.json(
        await run(
            () => setVariantImage(group, name, variant, image),
            () => getProductsWithYears()
        )
    );
}
