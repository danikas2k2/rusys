import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { respond, sendError } from '~/server/api/v1/utils';
import { setMissingBulk } from '~/server/data/products';

export async function handleProductReviewStatuses(req: ApiRequest, res: ApiResponse): Promise<void> {
    const { updates } = req.body as { updates?: readonly { group: string; name: string; missing: boolean }[] };
    if (
        !updates?.length ||
        updates.some(({ group, name, missing }) => !group || !name || typeof missing !== 'boolean')
    ) {
        sendError(res, 400, 'VALIDATION_ERROR', 'updates must contain group, name, and missing for each product');
        return;
    }
    await respond(res, () => setMissingBulk(updates));
}
