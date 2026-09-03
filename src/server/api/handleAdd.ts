import type { ApiAddProduct, ApiProductsWithYears, ApiRequest, ApiResponse } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { addProduct } from '~/server/data/products';

export async function handleAdd(req: ApiRequest<ApiAddProduct>, res: ApiResponse<ApiProductsWithYears>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, parent } = req.body;
    res.json(
        await run(
            () => addProduct(group, name, parent),
            () => getProductsWithYears()
        )
    );
}
