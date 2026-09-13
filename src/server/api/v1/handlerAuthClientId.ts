import { DEV_CLIENT_ID, isDevMode } from '@rusys/common/utils/dev';
import type { Router } from 'express';

import { sendError } from '~/server/api/v1/utils';

export function registerAuthClientIdHandler(router: Router): void {
    router.get('/auth/client-id', (_req, res) => {
        const clientId = process.env.GOOGLE_CLIENT_ID ?? (isDevMode() ? DEV_CLIENT_ID : undefined);
        if (!clientId) {
            sendError(res, 503, 'CONFIGURATION_ERROR', 'Google client ID is not configured');
            return;
        }
        res.json({ clientId });
    });
}
