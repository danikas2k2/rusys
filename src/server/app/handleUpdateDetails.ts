import { type ApiDetailsWithYears, type ApiRequest, type ApiResponse, type ApiUpdateDetails } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getDetailsWithYears, updateDetails } from '~/server/data/details';

export async function handleUpdateDetails(
    req: ApiRequest<ApiUpdateDetails>,
    res: ApiResponse<ApiDetailsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year, amounts } = req.body;
    res.json(
        await run(
            () => updateDetails(group, name, year, amounts),
            () => getDetailsWithYears()
        )
    );
}
