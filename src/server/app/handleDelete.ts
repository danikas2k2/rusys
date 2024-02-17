import { type ApiRequest, type ApiResponse, type ApiRequestDetails, type ApiDetails } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { deleteDetails, getYearsAndDetails } from '~/server/data/details';

export async function handleDelete(req: ApiRequest<ApiRequestDetails>, res: ApiResponse<ApiDetails>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name } = req.body;
    res.json(
        await run(
            () => deleteDetails(group, name),
            () => getYearsAndDetails()
        )
    );
}
