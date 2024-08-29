import {
    type ApiDetails,
    type ApiMoveDetails,
    type ApiRequest,
    type ApiResponse,
    type ApiVariants,
} from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { moveDetailsOccurrences } from '~/server/data/common';
import { getDetailsAndVariants } from '~/server/data/variants';

export async function handleMove(
    req: ApiRequest<ApiMoveDetails>,
    res: ApiResponse<ApiDetails & ApiVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, newGroup, newName } = req.body;
    res.json(
        await run(
            () => moveDetailsOccurrences(group, name, newGroup, newName),
            () => getDetailsAndVariants()
        )
    );
}
