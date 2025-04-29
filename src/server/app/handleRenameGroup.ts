import { type ApiDetailsWithYears, type ApiRenameGroup, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { renameGroupOccurrences } from '~/server/data/common';
import { getAllDetails } from '~/server/data/details';

export async function handleRenameGroup(
    req: ApiRequest<ApiRenameGroup>,
    res: ApiResponse<ApiDetailsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, newGroup } = req.body;
    res.json(
        await run(
            () => renameGroupOccurrences(group, newGroup),
            () => getAllDetails()
        )
    );
}
