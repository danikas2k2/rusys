import { type ApiCopyVariant, type ApiDetailsWithVariants, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { copyVariant, getDetailsAndVariants } from '~/server/data/variants';

export async function handleCopyVariant(
    req: ApiRequest<ApiCopyVariant>,
    res: ApiResponse<ApiDetailsWithVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant, newGroup, newVariant, ...update } = req.body;
    res.json(
        await run(
            () => copyVariant(group, variant, newGroup, newVariant, update),
            () => getDetailsAndVariants()
        )
    );
}
