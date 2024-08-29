import {
    type ApiDetails,
    type ApiRequest,
    type ApiRequestGroup,
    type ApiResponse,
    type ApiVariants,
} from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { deleteGroupOccurrences } from '~/server/data/common';
import { getDetailsAndVariants } from '~/server/data/variants';

export async function handleDeleteGroup(
    req: ApiRequest<ApiRequestGroup>,
    res: ApiResponse<ApiDetails & ApiVariants>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group } = req.body;
    res.json(await run(() => deleteGroupOccurrences(group), getDetailsAndVariants));
}
