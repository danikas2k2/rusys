import type { ApiRequest, ApiResponse, ApiUpsertUserProfile } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { upsertUserProfile } from '~/server/data/userProfiles';

export async function handleUpsertUserProfile(req: ApiRequest<ApiUpsertUserProfile>, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { email, name, picture } = req.body;
    res.json(await run(() => upsertUserProfile(email, name, picture)));
}
