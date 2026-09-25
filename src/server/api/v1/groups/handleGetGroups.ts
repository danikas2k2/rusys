import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { getGroups } from '~/server/data/groups';

export async function handleGetGroups(req: ApiRequest, res: ApiResponse): Promise<void> {
    res.json({ groups: await getGroups() });
}
