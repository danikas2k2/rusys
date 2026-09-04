import type { ApiClientId, ApiRequest, ApiResponse } from '@rusys/common/api';
import { DEV_CLIENT_ID, isDevMode } from '@rusys/common/utils/dev';

import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';

export async function handleClientId(req: ApiRequest, res: ApiResponse<ApiClientId>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);

    const clientId = process.env.GOOGLE_CLIENT_ID ?? (isDevMode() ? DEV_CLIENT_ID : undefined);
    // The response mapper only runs when run() has already confirmed clientId is truthy.
    res.json(
        await run(
            () => clientId,
            () => ({ clientId: clientId! })
        )
    );
}
