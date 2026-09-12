import type { VariantUnits } from '@rusys/common/data';
import type { Router } from 'express';

import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { copyVariant } from '~/server/data/variants';

export function registerPostVariantCopyHandler(router: Router): void {
    router.post('/groups/:group/variants/:variant/copies', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const variant = requiredParam(req, res, 'variant');
        const { newGroup, newVariant, order, suffix, count, units } = req.body as {
            newGroup?: string;
            newVariant?: string;
            order?: number;
            suffix?: string;
            count?: number;
            units?: VariantUnits;
        };
        if (!group || !variant || !newGroup) {
            sendError(res, 400, 'VALIDATION_ERROR', 'newGroup is required');
            return;
        }
        await respond(res, () => copyVariant(group, variant, newGroup, newVariant, { order, suffix, count, units }));
    });
}
