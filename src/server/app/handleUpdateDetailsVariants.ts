import { type ApiResponse, type ApiRequest, type ApiDetails, type ApiUpdateDetailsAmounts } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getYearsAndDetails, updateDetailsAmounts } from '~/server/data/details';

export async function handleUpdateDetailsVariants(
    req: ApiRequest<ApiUpdateDetailsAmounts>,
    res: ApiResponse<ApiDetails>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, year, amounts, withoutHistory } = req.body;
    res.json(
        await run(
            () => updateDetailsAmounts(group, name, year, amounts, withoutHistory),
            () => getYearsAndDetails()
        )
    );
}
