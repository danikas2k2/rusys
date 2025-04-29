import { type ApiRequest, type ApiResponse, type ApiUpdateVariant, type ApiVariants } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getVariantsResponse, updateVariant } from '~/server/data/variants';

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
