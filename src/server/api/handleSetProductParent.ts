import type { ApiProductsWithYears, ApiRequest, ApiResponse, ApiSetParent } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { setProductParent } from '~/server/data/products';

export async function handleSetProductParent(
    req: ApiRequest<ApiSetParent>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, parent } = req.body;
    res.json(
        await run(
            () => setProductParent(group, name, parent),
            () => getProductsWithYears()
        )
    );
}
