import { type ApiRequest, type ApiResponse, type ApiDetails, type ApiRenameGroup } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { renameGroupOccurrences } from '~/server/data/common';
import { getYearsAndDetails } from '~/server/data/details';

export async function handleRenameGroup(req: ApiRequest<ApiRenameGroup>, res: ApiResponse<ApiDetails>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, newGroup } = req.body;
    res.json(
        await run(
            () => renameGroupOccurrences(group, newGroup),
            () => getYearsAndDetails()
        )
    );
}
