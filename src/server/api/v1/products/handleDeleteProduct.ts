import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, respond } from '~/server/api/v1/utils';
import { deleteProduct } from '~/server/data/products';

export async function handleDeleteProduct(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    if (!group || !name) {
        return;
    }
    await respond(res, () => deleteProduct(group, name));
}
