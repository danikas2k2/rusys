import type { ApiProductsWithYears, ApiRequest, ApiRequestProduct, ApiResponse } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { undoProduct } from '~/server/data/products';

export async function handleUndoProduct(
    req: ApiRequest<ApiRequestProduct>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year = 0 } = req.body;
    res.json(
        await run(
            () => undoProduct(group, name, year),
            () => getProductsWithYears()
        )
    );
}
