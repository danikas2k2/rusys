import type { Router } from 'express';

import { requiredParam, respond } from '~/server/api/v1/utils';
import { deleteVariant } from '~/server/data/variants';

export function registerDeleteVariantHandler(router: Router): void {
    router.delete('/groups/:group/variants/:variant', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const variant = requiredParam(req, res, 'variant');
        if (!group || !variant) {
            return;
        }
        await respond(res, () => deleteVariant(group, variant));
    });
}
