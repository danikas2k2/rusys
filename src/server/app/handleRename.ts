import { type ApiResponse, type ApiRequest, type ApiDetails, type ApiRenameDetails } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getYearsAndDetails, renameDetails } from '~/server/data/details';

export async function handleRename(req: ApiRequest<ApiRenameDetails>, res: ApiResponse<ApiDetails>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, newName } = req.body;
    res.json(
        await run(
            () => renameDetails(group, name, newName),
            () => getYearsAndDetails()
        )
    );
}
