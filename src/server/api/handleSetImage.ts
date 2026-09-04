import type { ApiProductsWithYears, ApiRequest, ApiResponse, ApiSetImage } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { setImage } from '~/server/data/products';

export async function handleSetImage(
    req: ApiRequest<ApiSetImage>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, image } = req.body;
    res.json(
        await run(
            () => setImage(group, name, image),
            () => getProductsWithYears()
        )
    );
}
