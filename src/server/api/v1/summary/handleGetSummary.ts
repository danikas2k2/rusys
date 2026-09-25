import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { getFullSummary } from '~/server/data/summary';

export async function handleGetSummary(req: ApiRequest, res: ApiResponse): Promise<void> {
    res.json(await getFullSummary());
}
