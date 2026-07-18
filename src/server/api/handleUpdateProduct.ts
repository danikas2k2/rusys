import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { updateProduct } from '~/server/data/products';
import type { ApiProductsWithYears, ApiRequest, ApiResponse, ApiUpdateProduct } from '~/types/api';

export async function handleUpdateProduct(
    req: ApiRequest<ApiUpdateProduct>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year, amounts, user, comment } = req.body;
    res.json(
        await run(
            () => updateProduct(group, name, year, amounts, user, comment),
            () => getProductsWithYears()
        )
    );
}
