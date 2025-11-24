import { debugRequest } from '~/server/api/debug';
import { getDetailsWithYears } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { moveDetailsOccurrences } from '~/server/data/common';
import type { ApiDetailsWithYears, ApiMoveDetails, ApiRequest, ApiResponse } from '~/types/api';

export async function handleMove(
    req: ApiRequest<ApiMoveDetails>,
    res: ApiResponse<ApiDetailsWithYears>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, newGroup, newName } = req.body;
    res.json(
        await run(
            () => moveDetailsOccurrences(group, name, newGroup, newName),
            () => getDetailsWithYears()
        )
    );
}
