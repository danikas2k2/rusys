import type { VariantAmount } from '@rusys/common/data';
import type { Router } from 'express';

import { requiredParam, requiredYear, respond, sendError } from '~/server/api/v1/utils';
import { setAmounts } from '~/server/data/products';

export function registerPutProductAmountsHandler(router: Router): void {
    router.put('/groups/:group/products/:name/years/:year/amounts', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        const { amounts, user, comment } = req.body as {
            amounts?: readonly VariantAmount[];
            user?: string;
            comment?: string;
        };
        if (!group || !name || year == null || !amounts?.length) {
            sendError(res, 400, 'VALIDATION_ERROR', 'amounts is required');
            return;
        }
        await respond(res, () => setAmounts(group, name, year, amounts, user, comment));
    });
}
