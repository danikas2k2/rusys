import { type ApiReorderVariants, type ApiRequest, type ApiResponse, type ApiVariants } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getVariants, reorderVariants } from '~/server/data/variants';

export async function handleReorderVariants(
    req: ApiRequest<ApiReorderVariants>,
    res: ApiResponse<ApiVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variants } = req.body;
    res.json(
        await run(
            () => reorderVariants(group, variants),
            async () => ({ variants: await getVariants() })
        )
    );
}
