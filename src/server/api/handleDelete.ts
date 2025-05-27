import { debugRequest } from '~/server/api/debug';
import { getDetailsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { deleteDetails } from '~/server/data/details';
import { type ApiDetailsWithYears, type ApiRequest, type ApiRequestDetails, type ApiResponse } from '~/types/api';

export async function handleDelete(
    req: ApiRequest<ApiRequestDetails>,
    res: ApiResponse<ApiDetailsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name } = req.body;
    res.json(
        await run(
            () => deleteDetails(group, name),
            () => getDetailsWithYears()
        )
    );
}
