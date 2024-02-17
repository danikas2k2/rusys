import { type ApiRequest, type ApiResponse, type ApiRequestGroup, type ApiDetails } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { deleteGroupOccurrences } from '~/server/data/common';
import { getYearsAndDetails } from '~/server/data/details';

export async function handleDeleteGroup(req: ApiRequest<ApiRequestGroup>, res: ApiResponse<ApiDetails>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group } = req.body;
    res.json(
        await run(
            () => deleteGroupOccurrences(group),
            () => getYearsAndDetails()
        )
    );
}
