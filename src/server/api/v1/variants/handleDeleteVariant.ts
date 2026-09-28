import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, respond } from '~/server/api/v1/utils';
import { deleteVariant } from '~/server/data/variants';

export async function handleDeleteVariant(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const variant = requiredParam(req, res, 'variant');
    if (!group || !variant) {
        return;
    }
    await respond(res, () => deleteVariant(group, variant));
}
