import type { Request, Response } from 'express';

import { requiredParam, requiredYear } from '~/server/api/v1/utils';
import { getProductUndates, getProductUpdates } from '~/server/data/products';

export async function handleGetProductHistory(req: Request, res: Response): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    const year = requiredYear(req, res);
    if (!group || !name || year == null) {
        return;
    }
    res.json({
        updates: await getProductUpdates(group, name, year),
        undates: await getProductUndates(group, name, year),
    });
}
