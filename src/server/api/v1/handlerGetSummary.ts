import type { Router } from 'express';

import { getFullSummary } from '~/server/data/summary';

export function registerGetSummaryHandler(router: Router): void {
    router.get('/summary', async (_req, res) => res.json(await getFullSummary()));
}
