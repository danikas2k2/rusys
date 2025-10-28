import { debugRequest } from '~/server/api/debug';
import { getDetailsWithVariants } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { renameVariantOccurrences } from '~/server/data/common';
import type { ApiRenameVariant, ApiRequest, ApiResponse, ApiVariants } from '~/types/api';

export async function handleRenameVariant(
    req: ApiRequest<ApiRenameVariant>,
    res: ApiResponse<ApiVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant, newVariant, ...update } = req.body;
    res.json(
        await run(
            () => renameVariantOccurrences(group, variant, newVariant, update),
            () => getDetailsWithVariants()
        )
    );
}
