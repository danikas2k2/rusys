import type { ApiProductsWithYears, ApiRenameProduct, ApiRequest, ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { renameProduct } from '~/server/data/products';

export async function handleRename(
    req: ApiRequest<ApiRenameProduct>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, newName } = req.body;
    res.json(
        await run(
            () => renameProduct(group, name, newName),
            () => getProductsWithYears()
        )
    );
}
