import type { ApiMoveConsumedToRecycled, ApiRequest, ApiResponse } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { moveConsumedToRecycled } from '~/server/data/products';

export async function handleMoveConsumedToRecycled(
    req: ApiRequest<ApiMoveConsumedToRecycled>,
    res: ApiResponse
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year, variant, amount, suspicious, home, expiresAt, user } = req.body;
    res.json(
        await run(() =>
            moveConsumedToRecycled(group, name, year, variant, amount, { suspicious, home, expiresAt }, user)
        )
    );
}
