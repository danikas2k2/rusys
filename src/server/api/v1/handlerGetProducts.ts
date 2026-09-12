import type { Router } from 'express';

import { getProductsWithYears } from '~/server/api/response';

export function registerGetProductsHandler(router: Router): void {
    router.get('/products', async (_req, res) => res.json(await getProductsWithYears()));
}
