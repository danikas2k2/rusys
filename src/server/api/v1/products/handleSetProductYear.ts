import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, requiredYear, respond, sendError } from '~/server/api/v1/utils';
import { setRemoving } from '~/server/data/products';

export async function handleSetProductYear(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    const year = requiredYear(req, res);
    const { removing } = req.body as { removing?: unknown };
    if (!group || !name || year == null || typeof removing !== 'boolean') {
        sendError(res, 400, 'VALIDATION_ERROR', 'removing must be a boolean');
        return;
    }
    await respond(res, () => setRemoving(group, name, year, removing));
}
