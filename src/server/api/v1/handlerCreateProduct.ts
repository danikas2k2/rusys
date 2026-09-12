import type { Router } from 'express';

import { sendError } from '~/server/api/v1/utils';
import { addProduct } from '~/server/data/products';

export function registerCreateProductHandler(router: Router): void {
    router.post('/products', async (req, res) => {
        const { group, name, parent } = req.body as { group?: string; name?: string; parent?: string };
        if (!group || !name) {
            sendError(res, 400, 'VALIDATION_ERROR', 'group and name are required');
            return;
        }
        try {
            if (!(await addProduct(group, name, parent))) {
                sendError(res, 409, 'CONFLICT', 'The product already exists or could not be created');
                return;
            }
            res.status(201)
                .location(`/api/v1/groups/${encodeURIComponent(group)}/products/${encodeURIComponent(name)}`)
                .end();
        } catch (error) {
            sendError(res, 500, 'INTERNAL_ERROR', `${error}`);
        }
    });
}
