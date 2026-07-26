import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { setMissingBulk } from '~/server/data/products';
import type { ApiProductsWithYears, ApiRequest, ApiResponse, ApiSetMissingBulk } from '~/types/api';

export async function handleSetMissingBulk(
    req: ApiRequest<ApiSetMissingBulk>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { updates } = req.body;
    res.json(
        await run(
            () => setMissingBulk(updates),
            () => getProductsWithYears()
        )
    );
}
