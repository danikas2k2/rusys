import type { Router } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { reorderVariants } from '~/server/data/variants';

export function registerPutVariantsOrderHandler(router: Router): void {
    router.put('/groups/:group/variants/order', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const { variants } = req.body as { variants?: Readonly<Record<string, number>> };
        if (!group || !variants) {
            sendError(res, 400, 'VALIDATION_ERROR', 'variants is required');
            return;
        }
        await respond(res, () => reorderVariants(group, variants));
    });
}
