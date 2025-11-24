import { debugRequest } from '~/server/api/debug';
import { getDetailsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { renameDetails } from '~/server/data/details';
import type { ApiDetailsWithYears, ApiRenameDetails, ApiRequest, ApiResponse } from '~/types/api';

export async function handleRename(
    req: ApiRequest<ApiRenameDetails>,
    res: ApiResponse<ApiDetailsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, newName } = req.body;
    res.json(
        await run(
            () => renameDetails(group, name, newName),
            () => getDetailsWithYears()
        )
    );
}
