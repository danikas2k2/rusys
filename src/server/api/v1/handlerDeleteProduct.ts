import type { Router } from 'express';

import { requiredParam, respond } from '~/server/api/v1/utils';
import { deleteProduct } from '~/server/data/products';

export function registerDeleteProductHandler(router: Router): void {
    router.delete('/groups/:group/products/:name', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        if (!group || !name) {
            return;
        }
        await respond(res, () => deleteProduct(group, name));
    });
}
