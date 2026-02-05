import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { getGroups } from '~/server/data/groups';
import { getHistorySessions } from '~/server/data/history';
import type { ApiHistory, ApiRequest, ApiRequestYear, ApiResponse } from '~/types/api';

export async function handleHistory(req: ApiRequest<ApiRequestYear>, res: ApiResponse<ApiHistory>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);

    const year = req.body?.year;
    if (typeof year !== 'number' || !Number.isFinite(year) || year < 2000 || year > new Date().getFullYear()) {
        throw new Error('Invalid year');
    }

    res.json(
        await run(async () => ({
            history: await getHistorySessions(year),
            groups: await getGroups(),
        }))
    );
}
