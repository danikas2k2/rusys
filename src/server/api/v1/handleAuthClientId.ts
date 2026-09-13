import { DEV_CLIENT_ID, isDevMode } from '@rusys/common/utils/dev';
import type { Request, Response } from 'express';

import { sendError } from '~/server/api/v1/utils';

export async function handleAuthClientId(req: Request, res: Response): Promise<void> {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? (isDevMode() ? DEV_CLIENT_ID : undefined);
    if (!clientId) {
        sendError(res, 503, 'CONFIGURATION_ERROR', 'Google client ID is not configured');
        return;
    }
    res.json({ clientId });
}
