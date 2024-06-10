import { type ApiRequest, type ApiResponse, ApiReorderGroups, ApiGroups } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getGroups, reorderGroups } from '~/server/data/groups';

export async function handleReorderGroups(
    req: ApiRequest<ApiReorderGroups>,
    res: ApiResponse<ApiGroups>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { groups } = req.body;
    res.json(
        await run(
            () => reorderGroups(groups),
            async () => ({ groups: await getGroups() })
        )
    );
}
