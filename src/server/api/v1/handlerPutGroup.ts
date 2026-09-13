import type { Router } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { updateGroup } from '~/server/data/groups';

export function registerPutGroupHandler(router: Router): void {
    router.put('/groups/:group', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        if (!group) {
            return;
        }
        const { annual, review, image } = req.body as { annual?: unknown; review?: unknown; image?: unknown };
        if (
            (annual != null && typeof annual !== 'boolean') ||
            (review != null && typeof review !== 'boolean') ||
            (image != null && typeof image !== 'string')
        ) {
            sendError(res, 400, 'VALIDATION_ERROR', 'annual and review must be booleans; image must be a string');
            return;
        }
        await respond(res, () =>
            updateGroup(
                group,
                typeof annual === 'boolean' ? annual : true,
                typeof review === 'boolean' ? review : false,
                typeof image === 'string' ? image : undefined
            )
        );
    });
}
