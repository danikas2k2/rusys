import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { setProductExpiryTolerance } from '~/server/data/products';
import type { ApiProductsWithYears, ApiRequest, ApiResponse, ApiSetExpiryTolerance } from '~/types/api';

export async function handleSetProductExpiryTolerance(
    req: ApiRequest<ApiSetExpiryTolerance>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, expiryToleranceDays } = req.body;
    res.json(
        await run(
            () => setProductExpiryTolerance(group, name, expiryToleranceDays),
            () => getProductsWithYears()
        )
    );
}
