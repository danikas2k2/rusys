import type { ApiGroups, ApiRequest, ApiRequestGroup, ApiResponse } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { getProductsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { deleteGroupOccurrences } from '~/server/data/common';

export async function handleDeleteGroup(req: ApiRequest<ApiRequestGroup>, res: ApiResponse<ApiGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group } = req.body;
    res.json(
        await run(
            () => deleteGroupOccurrences(group),
            () => getProductsWithGroups()
        )
    );
}
