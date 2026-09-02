import type { ApiProductsWithYears, ApiRequest, ApiRequestProduct, ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { redoProduct } from '~/server/data/products';

export async function handleRedoProduct(
    req: ApiRequest<ApiRequestProduct>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year = 0 } = req.body;
    res.json(
        await run(
            () => redoProduct(group, name, year),
            () => getProductsWithYears()
        )
    );
}
