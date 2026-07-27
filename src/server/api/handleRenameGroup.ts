import { debugRequest } from '~/server/api/debug';
import { getProductsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { renameGroupOccurrences } from '~/server/data/common';
import type { ApiProductsWithYears, ApiRenameGroup, ApiRequest, ApiResponse } from '~/types/api';

export async function handleRenameGroup(
    req: ApiRequest<ApiRenameGroup>,
    res: ApiResponse<ApiProductsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, newGroup, annual, review, image } = req.body;
    res.json(
        await run(
            () => renameGroupOccurrences(group, newGroup, annual, review, image),
            () => getProductsWithGroups()
        )
    );
}
