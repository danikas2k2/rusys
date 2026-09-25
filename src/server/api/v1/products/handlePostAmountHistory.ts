import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, requiredYear, respond, sendError } from '~/server/api/v1/utils';
import { moveConsumedToRecycled } from '~/server/data/products';

export async function handlePostAmountHistory(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    const year = requiredYear(req, res);
    const { variant, amount, suspicious, home, expiresAt, user } = req.body as {
        variant?: string;
        amount?: number;
        suspicious?: boolean;
        home?: boolean;
        expiresAt?: number;
        user?: string;
    };
    if (!group || !name || year == null || !variant || !(amount && amount > 0)) {
        sendError(res, 400, 'VALIDATION_ERROR', 'variant and a positive amount are required');
        return;
    }
    await respond(res, () =>
        moveConsumedToRecycled(group, name, year, variant, amount, { suspicious, home, expiresAt }, user)
    );
}
