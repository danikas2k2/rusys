import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { updateHistory } from '~/server/data/history';
import type { ApiRequest, ApiResponse, ApiUpdateHistory } from '~/types/api';

export async function handleUpdateHistory(req: ApiRequest<ApiUpdateHistory>, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, time, year, amounts, user } = req.body;
    res.json(await run(() => updateHistory(group, name, time, year, amounts, user)));
}
