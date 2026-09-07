import type { Request, Response } from 'express';

import { respond, sendError } from '~/server/api/v1/utils';
import { reorderGroups } from '~/server/data/groups';

export async function handlePutGroupsOrder(req: Request, res: Response): Promise<void> {
    const { groups } = req.body as { groups?: Readonly<Record<string, number>> };
    if (!groups) {
        sendError(res, 400, 'VALIDATION_ERROR', 'groups is required');
        return;
    }
    await respond(res, () => reorderGroups(groups));
}
