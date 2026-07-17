import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { getGroups } from '~/server/data/groups';
import { getProductUndates, getProductUpdates } from '~/server/data/products';
import type { ApiHistory, ApiRequest, ApiRequestHistory, ApiRequestYear, ApiResponse } from '~/types/api';

export async function handleProductHistory(
    req: ApiRequest<ApiRequestHistory>,
    res: ApiResponse<ApiHistory>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);

    const { group, name, year } = req.body;

    res.json(
        await run(async () => ({
            updates: await getProductUpdates(group, name, year),
            undates: await getProductUndates(group, name, year),
            groups: await getGroups(),
        }))
    );
}
