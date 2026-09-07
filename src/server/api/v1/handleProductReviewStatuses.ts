import type { Request, Response } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { setMissingBulk } from '~/server/data/products';

export async function handleProductReviewStatuses(req: Request, res: Response): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const { updates } = req.body as { updates?: readonly { name: string; missing: boolean }[] };
    if (!group || !updates?.length || updates.some(({ name, missing }) => !name || typeof missing !== 'boolean')) {
        sendError(res, 400, 'VALIDATION_ERROR', 'updates must contain name and missing for each product');
        return;
    }
    await respond(res, () => setMissingBulk(updates.map((update) => ({ ...update, group }))));
}
