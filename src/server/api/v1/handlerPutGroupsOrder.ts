import type { Router } from 'express';

import { respond, sendError } from '~/server/api/v1/utils';
import { reorderGroups } from '~/server/data/groups';

export function registerPutGroupsOrderHandler(router: Router): void {
    router.put('/groups/order', async (req, res) => {
        const { groups } = req.body as { groups?: Readonly<Record<string, number>> };
        if (!groups) {
            sendError(res, 400, 'VALIDATION_ERROR', 'groups is required');
            return;
        }
        await respond(res, () => reorderGroups(groups));
    });
}
