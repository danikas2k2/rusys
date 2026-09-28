import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, requiredYear } from '~/server/api/v1/utils';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';

export async function handleGetProductSummaryHistory(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    const year = requiredYear(req, res);
    if (!group || !name || year == null) {
        return;
    }
    res.json({
        updates: await getSummaryUpdates(group, name, year),
        undates: await getSummaryUndates(group, name, year),
    });
}
