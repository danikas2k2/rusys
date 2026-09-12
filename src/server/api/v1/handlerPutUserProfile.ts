import type { Router } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { upsertUserProfile } from '~/server/data/userProfiles';

export function registerPutUserProfileHandler(router: Router): void {
    router.put('/user-profiles/:email', async (req, res) => {
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
    });
}
