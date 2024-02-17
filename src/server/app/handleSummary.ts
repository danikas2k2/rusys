import { type ApiRequest, type ApiResponse, type ApiSummary } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getSummary } from '~/server/data/updates';
import { getYears } from '~/server/data/years';

export async function handleSummary(req: ApiRequest, res: ApiResponse<ApiSummary>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const years = getYears();
    res.json(
        await run(
            () => getSummary(years),
            (summary) => ({ years, summary })
        )
    );
}
