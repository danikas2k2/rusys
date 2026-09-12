import type { Router } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { setVariantImage } from '~/server/data/products';

export function registerPutProductVariantImageHandler(router: Router): void {
    router.put('/groups/:group/products/:name/variants/:variant/image', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const variant = requiredParam(req, res, 'variant');
        const { image } = req.body as { image?: string };
        if (!group || !name || !variant || typeof image !== 'string') {
            sendError(res, 400, 'VALIDATION_ERROR', 'image is required');
            return;
        }
        await respond(res, () => setVariantImage(group, name, variant, image));
    });
}
