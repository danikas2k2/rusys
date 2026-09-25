import type { VariantAmount } from '@rusys/common/data';

import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, requiredYear, respond, sendError } from '~/server/api/v1/utils';
import { transferAmounts } from '~/server/data/products';

export async function handlePostProductAmountTransfer(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    const year = requiredYear(req, res);
    const { targetGroup, targetName, amounts, user, comment } = req.body as {
        targetGroup?: string;
        targetName?: string;
        amounts?: readonly VariantAmount[];
        user?: string;
        comment?: string;
    };
    if (!group || !name || year == null || !targetGroup || !targetName || !amounts?.length) {
        sendError(res, 400, 'VALIDATION_ERROR', 'target product and amounts are required');
        return;
    }
    await respond(res, () => transferAmounts(group, name, year, targetGroup, targetName, amounts, user, comment));
}
