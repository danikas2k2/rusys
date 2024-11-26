import {
    type ApiCopyVariant,
    type ApiDetails,
    type ApiRequest,
    type ApiResponse,
    type ApiVariants,
} from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { copyVariant, getDetailsAndVariants } from '~/server/data/variants';

export async function handleCopyVariant(
    req: ApiRequest<ApiCopyVariant>,
    res: ApiResponse<ApiDetails & ApiVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant, newGroup, newVariant, ...update } = req.body;
    res.json(await run(() => copyVariant(group, variant, newGroup, newVariant, update), getDetailsAndVariants));
}
