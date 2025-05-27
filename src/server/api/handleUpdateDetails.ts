import { debugRequest } from '~/server/api/debug';
import { getDetailsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { updateDetails } from '~/server/data/details';
import { type ApiDetailsWithYears, type ApiRequest, type ApiResponse, type ApiUpdateDetails } from '~/types/api';

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
