import type { Router } from 'express';

import { requiredParam, requiredYear, respond } from '~/server/api/v1/utils';
import { undoProduct } from '~/server/data/products';

export function registerPostAmountHistoryUndoHandler(router: Router): void {
    router.post('/groups/:group/products/:name/years/:year/amount-history/undo', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        if (!group || !name || year == null) {
            return;
        }
        await respond(res, () => undoProduct(group, name, year));
    });
}
