import type { Request, Response } from 'express';

import { requiredParam, respond } from '~/server/api/v1/utils';
import { deleteProduct } from '~/server/data/products';

export async function handleDeleteProduct(req: Request, res: Response): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    if (!group || !name) {
        return;
    }
    await respond(res, () => deleteProduct(group, name));
}
