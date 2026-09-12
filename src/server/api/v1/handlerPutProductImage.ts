import type { Router } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { setImage } from '~/server/data/products';

export function registerPutProductImageHandler(router: Router): void {
    router.put('/groups/:group/products/:name/image', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const { image } = req.body as { image?: string };
        if (!group || !name || typeof image !== 'string') {
            sendError(res, 400, 'VALIDATION_ERROR', 'image is required');
            return;
        }
        await respond(res, () => setImage(group, name, image));
    });
}
