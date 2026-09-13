import { isDevMode } from '@rusys/common/utils/dev';
import type { Request, Response } from 'express';

import { sendError } from '~/server/api/v1/utils';

export async function handleAccess(req: Request, res: Response): Promise<void> {
    const email = typeof req.query.email === 'string' ? req.query.email : undefined;
    if (!email) {
        sendError(res, 400, 'VALIDATION_ERROR', 'email is required');
        return;
    }
    const allowed = process.env.GOOGLE_ALLOWED_USERS?.split(',').includes(email) || isDevMode();
    res.json({ allowed });
}
