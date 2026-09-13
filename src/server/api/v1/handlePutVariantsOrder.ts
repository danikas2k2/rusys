import type { Request, Response } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { reorderVariants } from '~/server/data/variants';

export async function handlePutVariantsOrder(req: Request, res: Response): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const { variants } = req.body as { variants?: Readonly<Record<string, number>> };
    if (!group || !variants) {
        sendError(res, 400, 'VALIDATION_ERROR', 'variants is required');
        return;
    }
    await respond(res, () => reorderVariants(group, variants));
}
