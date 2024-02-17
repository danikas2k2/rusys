import { type ApiClientId, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';

export async function handleClientId(req: ApiRequest, res: ApiResponse<ApiClientId>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);

    const clientId = process.env.GOOGLE_CLIENT_ID ?? (process.env.NODE_ENV === 'development' ? 'dev_mode' : undefined);
    res.json(
        await run(
            () => clientId,
            () => ({ clientId })
        )
    );
}
