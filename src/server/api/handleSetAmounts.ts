import type { ApiProductsWithYears, ApiRequest, ApiResponse, ApiSetAmounts } from '~/common/api';
import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { setAmounts } from '~/server/data/products';

export async function handleSetAmounts(
    req: ApiRequest<ApiSetAmounts>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year, amounts, user, comment } = req.body;
    res.json(
        await run(
            () => setAmounts(group, name, year, amounts, user, comment),
            () => getProductsWithYears()
        )
    );
}
