import { type ApiRequest, type ApiResponse, type ApiVariants } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getVariants, setVariants } from '~/server/data/variants';

export async function handleSetVariants(req: ApiRequest<ApiVariants>, res: ApiResponse<ApiVariants>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { variants } = req.body;
    res.json(
        await run(
            () => setVariants(variants),
            async () => ({ variants: await getVariants() })
        )
    );
}
