import { type ApiRenameVariant, type ApiRequest, type ApiResponse, type ApiVariants } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { renameVariantOccurrences } from '~/server/data/common';
import { getDetailsAndVariants } from '~/server/data/variants';

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
            () => getDetailsAndVariants()
        )
    );
}
