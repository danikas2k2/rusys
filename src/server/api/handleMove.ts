import type { ApiMoveProduct, ApiProductsWithYears, ApiRequest, ApiResponse } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { getProductsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { moveProductOccurrences } from '~/server/data/common';

export async function handleMove(
    req: ApiRequest<ApiMoveProduct>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, newGroup, newName } = req.body;
    res.json(
        await run(
            () => moveProductOccurrences(group, name, newGroup, newName),
            () => getProductsWithYears()
        )
    );
}
