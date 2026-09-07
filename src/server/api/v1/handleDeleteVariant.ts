import type { Request, Response } from 'express';

import { requiredParam, respond } from '~/server/api/v1/utils';
import { deleteVariant } from '~/server/data/variants';

export async function handleDeleteVariant(req: Request, res: Response): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const variant = requiredParam(req, res, 'variant');
    if (!group || !variant) {
        return;
    }
    await respond(res, () => deleteVariant(group, variant));
}
