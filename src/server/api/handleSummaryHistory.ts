import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { getGroups } from '~/server/data/groups';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';
import type { ApiHistory, ApiRequest, ApiRequestHistory, ApiResponse } from '~/types/api';

export async function handleSummaryHistory(
    req: ApiRequest<ApiRequestHistory>,
    res: ApiResponse<ApiHistory>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year } = req.body;
    res.json(
        await run(async () => ({
            updates: await getSummaryUpdates(group, name, year),
            undates: await getSummaryUndates(group, name, year),
            groups: await getGroups(),
        }))
    );
}
