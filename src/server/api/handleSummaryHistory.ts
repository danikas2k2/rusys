import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { getGroups } from '~/server/data/groups';
import { getHistorySessionsByDate, getUndateSessionsByDate } from '~/server/data/history';
import type { ApiHistory, ApiRequest, ApiRequestHistoryGet, ApiResponse } from '~/types/api';

export async function handleSummaryHistory(
    req: ApiRequest<ApiRequestHistoryGet>,
    res: ApiResponse<ApiHistory>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year } = req.body;
    res.json(
        await run(async () => ({
            updates: await getHistorySessionsByDate(year, group, name),
            undates: await getUndateSessionsByDate(year, group, name),
            groups: await getGroups(),
        }))
    );
}
