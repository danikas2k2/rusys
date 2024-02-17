import { type ApiRequest, type ApiResponse, type ApiRequestVariant, type ApiDetails } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { deleteVariantOccurrences } from '~/server/data/common';
import { getYearsAndDetails } from '~/server/data/details';

export async function handleDeleteVariant(
    req: ApiRequest<ApiRequestVariant>,
    res: ApiResponse<ApiDetails>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant } = req.body;
    res.json(
        await run(
            () => deleteVariantOccurrences(group, variant),
            () => getYearsAndDetails()
        )
    );
}
