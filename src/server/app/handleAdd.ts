import { type ApiDetailsWithYears, type ApiRequest, type ApiRequestDetails, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { addDetails, getDetailsWithYears } from '~/server/data/details';

export async function handleAdd(
    req: ApiRequest<ApiRequestDetails>,
    res: ApiResponse<ApiDetailsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name } = req.body;
    res.json(
        await run(
            () => addDetails(group, name),
            () => getDetailsWithYears()
        )
    );
}
