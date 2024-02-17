import { type ApiRequest, type ApiResponse, type ApiDetails, type ApiUpdateDetailsYears } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { getYearsAndDetails, updateDetailsYears } from '~/server/data/details';

export async function handleUpdateDetailsYears(
    req: ApiRequest<ApiUpdateDetailsYears>,
    res: ApiResponse<ApiDetails>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const { group, name, years, withoutHistory } = req.body;
    res.json(
        await run(
            () => updateDetailsYears(group, name, years, withoutHistory),
            () => getYearsAndDetails()
        )
    );
}
