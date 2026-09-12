import { isDevMode } from '@rusys/common/utils/dev';
import type { Router } from 'express';

import { sendError } from '~/server/api/v1/utils';

export function registerAccessHandler(router: Router): void {
    router.get('/access', (req, res) => {
        const email = typeof req.query.email === 'string' ? req.query.email : undefined;
        if (!email) {
            sendError(res, 400, 'VALIDATION_ERROR', 'email is required');
            return;
        }
        const allowed = process.env.GOOGLE_ALLOWED_USERS?.split(',').includes(email) || isDevMode();
        res.json({ allowed });
    });
}
