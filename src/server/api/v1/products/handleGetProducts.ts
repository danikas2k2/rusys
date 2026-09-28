import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { getProductsWithYears } from '~/server/data/products';

export async function handleGetProducts(req: ApiRequest, res: ApiResponse): Promise<void> {
    res.json(await getProductsWithYears());
}
