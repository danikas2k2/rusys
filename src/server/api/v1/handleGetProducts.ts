import type { Request, Response } from 'express';

import { getProductsWithYears } from '~/server/api/response';

export async function handleGetProducts(req: Request, res: Response): Promise<void> {
    res.json(await getProductsWithYears());
}
