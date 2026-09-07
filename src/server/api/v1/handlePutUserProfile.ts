import type { Request, Response } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { upsertUserProfile } from '~/server/data/userProfiles';

export async function handlePutUserProfile(req: Request, res: Response): Promise<void> {
    const email = requiredParam(req, res, 'email');
    if (!email) {
        return;
    }
    const { name, picture } = req.body as { name?: unknown; picture?: unknown };
    if ((name != null && typeof name !== 'string') || (picture != null && typeof picture !== 'string')) {
        sendError(res, 400, 'VALIDATION_ERROR', 'name and picture must be strings');
        return;
    }
    await respond(res, () =>
        upsertUserProfile(
            email,
            typeof name === 'string' ? name : undefined,
            typeof picture === 'string' ? picture : undefined
        )
    );
}
