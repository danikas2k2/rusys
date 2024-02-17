import { type ApiRequest, type ApiResponse, type ApiGroups } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getGroups } from '~/server/data/groups';

export async function handleGroups(req: ApiRequest, res: ApiResponse<ApiGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(
        await run(
            () => getGroups(),
            (groups) => ({ groups })
        )
    );
}
