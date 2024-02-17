import { type ApiRequest, type ApiResponse, type ApiVariants } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getVariants } from '~/server/data/variants';

export async function handleVariants(req: ApiRequest, res: ApiResponse<ApiVariants>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(
        await run(
            () => getVariants(),
            (variants) => ({ variants })
        )
    );
}
