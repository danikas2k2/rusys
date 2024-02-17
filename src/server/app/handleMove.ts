import { type ApiRequest, type ApiResponse, type ApiDetails, type ApiMoveDetails } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getYearsAndDetails, moveDetails } from '~/server/data/details';

export async function handleMove(req: ApiRequest<ApiMoveDetails>, res: ApiResponse<ApiDetails>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, newGroup } = req.body;
    res.json(
        await run(
            () => moveDetails(group, name, newGroup),
            () => getYearsAndDetails()
        )
    );
}
