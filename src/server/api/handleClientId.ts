import { DEV_CLIENT_ID, isDevMode } from '~/common/utils/dev';
import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import type { ApiClientId, ApiRequest, ApiResponse } from '~/types/api';

export async function handleClientId(req: ApiRequest, res: ApiResponse<ApiClientId>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);

    const clientId = process.env.GOOGLE_CLIENT_ID ?? (isDevMode() ? DEV_CLIENT_ID : undefined);
    res.json(
        await run(
            () => clientId,
            () => (clientId ? { clientId } : undefined)
        )
    );
}
