import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, requiredYear, respond } from '~/server/api/v1/utils';
import { undoProduct } from '~/server/data/products';

export async function handlePostAmountHistoryUndo(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    const year = requiredYear(req, res);
    if (!group || !name || year == null) {
        return;
    }
    await respond(res, () => undoProduct(group, name, year));
}
