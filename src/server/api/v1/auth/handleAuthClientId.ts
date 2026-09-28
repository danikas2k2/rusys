import { DEV_CLIENT_ID, isDevMode } from '~/common/utils/dev';
import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { sendError } from '~/server/api/v1/utils';

export async function handleAuthClientId(req: ApiRequest, res: ApiResponse): Promise<void> {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? (isDevMode() ? DEV_CLIENT_ID : undefined);
    if (!clientId) {
        sendError(res, 503, 'CONFIGURATION_ERROR', 'Google client ID is not configured');
        return;
    }
    res.json({ clientId });
}
