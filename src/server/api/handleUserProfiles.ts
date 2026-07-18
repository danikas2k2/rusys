import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { getUserProfiles } from '~/server/data/userProfiles';
import type { ApiGetUserProfiles, ApiRequest, ApiResponse, ApiUserProfiles } from '~/types/api';

export async function handleUserProfiles(
    req: ApiRequest<ApiGetUserProfiles>,
    res: ApiResponse<ApiUserProfiles>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { emails } = req.body;
    res.json(
        await run(
            () => getUserProfiles(emails),
            (profiles) => ({ profiles })
        )
    );
}
