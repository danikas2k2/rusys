import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import type { ApiClientId, ApiRequest, ApiResponse } from '~/types/api';

export const DEV_CLIENT_ID = 'dev-mode';

export async function handleClientId(req: ApiRequest, res: ApiResponse<ApiClientId>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);

    const clientId =
        process.env.GOOGLE_CLIENT_ID ?? (process.env.NODE_ENV === 'development' ? DEV_CLIENT_ID : undefined);
    res.json(
        await run(
            () => clientId,
            () => ({ clientId })
        )
    );
}
