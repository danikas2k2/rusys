import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, respond } from '~/server/api/v1/utils';
import { deleteGroupOccurrences } from '~/server/data/common';

export async function handleDeleteGroup(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    if (!group) {
        return;
    }
    await respond(res, () => deleteGroupOccurrences(group));
}
