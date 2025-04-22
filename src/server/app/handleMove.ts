import { type ApiDetailsWithYears, type ApiMoveDetails, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { moveDetailsOccurrences } from '~/server/data/common';
import { getDetailsWithYears } from '~/server/data/details';

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
