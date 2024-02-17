import { type ApiRequest, type ApiResponse, type ApiDetails, type ApiRenameVariant } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { renameVariantOccurrences } from '~/server/data/common';
import { getYearsAndDetails } from '~/server/data/details';

export async function handleRenameVariant(
    req: ApiRequest<ApiRenameVariant>,
    res: ApiResponse<ApiDetails>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, variant, newVariant } = req.body;
    res.json(
        await run(
            () => renameVariantOccurrences(group, variant, newVariant),
            () => getYearsAndDetails()
        )
    );
}
