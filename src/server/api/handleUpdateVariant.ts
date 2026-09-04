import type { ApiRequest, ApiResponse, ApiUpdateVariant, ApiVariants } from '@rusys/common/api';

import { debugRequest } from '~/server/api/debug';
import { getVariantsResponse } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { updateVariant } from '~/server/data/variants';

export async function handleUpdateVariant(
    req: ApiRequest<ApiUpdateVariant>,
    res: ApiResponse<ApiVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant, ...update } = req.body;
    res.json(
        await run(
            () => updateVariant(group, variant, update),
            () => getVariantsResponse()
        )
    );
}
