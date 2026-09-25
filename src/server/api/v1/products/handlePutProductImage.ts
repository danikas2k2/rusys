import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { setImage } from '~/server/data/products';

export async function handlePutProductImage(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    const { image } = req.body as { image?: string };
    if (!group || !name || typeof image !== 'string') {
        sendError(res, 400, 'VALIDATION_ERROR', 'image is required');
        return;
    }
    await respond(res, () => setImage(group, name, image));
}
