import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { deleteHistory } from '~/server/data/history';
import type { ApiRequest, ApiRequestHistory, ApiResponse } from '~/types/api';

export async function handleDeleteHistory(req: ApiRequest<ApiRequestHistory>, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, time, year } = req.body;
    res.json(await run(() => deleteHistory(group, name, time, year)));
}
