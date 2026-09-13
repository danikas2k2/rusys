import type { Router } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { setMissingBulk } from '~/server/data/products';

export function registerProductReviewStatusesHandler(router: Router): void {
    router.patch('/groups/:group/products/review-statuses', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const { updates } = req.body as { updates?: readonly { name: string; missing: boolean }[] };
        if (!group || !updates?.length || updates.some(({ name, missing }) => !name || typeof missing !== 'boolean')) {
            sendError(res, 400, 'VALIDATION_ERROR', 'updates must contain name and missing for each product');
            return;
        }
        await respond(res, () => setMissingBulk(updates.map((update) => ({ ...update, group }))));
    });
}
