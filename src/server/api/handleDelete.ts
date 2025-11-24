import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { deleteProduct } from '~/server/data/products';
import type { ApiProductsWithYears, ApiRequest, ApiRequestProduct, ApiResponse } from '~/types/api';

export async function handleDelete(
    req: ApiRequest<ApiRequestProduct>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name } = req.body;
    res.json(
        await run(
            () => deleteProduct(group, name),
            () => getProductsWithYears()
        )
    );
}
