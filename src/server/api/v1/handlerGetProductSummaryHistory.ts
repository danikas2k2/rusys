import type { Router } from 'express';

import { requiredParam, requiredYear } from '~/server/api/v1/utils';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';

export function registerGetProductSummaryHistoryHandler(router: Router): void {
    router.get('/groups/:group/products/:name/years/:year/summary-history', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        const name = requiredParam(req, res, 'name');
        const year = requiredYear(req, res);
        if (!group || !name || year == null) {
            return;
        }
        res.json({
            updates: await getSummaryUpdates(group, name, year),
            undates: await getSummaryUndates(group, name, year),
        });
    });
}
