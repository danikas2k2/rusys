import { type ApiRequest, type ApiRequestVariant, type ApiResponse, type ApiVariants } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { deleteVariantOccurrences } from '~/server/data/common';
import { getDetailsAndVariants } from '~/server/data/variants';

export async function handleDeleteVariant(
    req: ApiRequest<ApiRequestVariant>,
    res: ApiResponse<ApiVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant } = req.body;
    res.json(
        await run(
            () => deleteVariantOccurrences(group, variant),
            () => getDetailsAndVariants()
        )
    );
}
