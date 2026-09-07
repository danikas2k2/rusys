import type { Request, Response } from 'express';

import { requiredParam, respond } from '~/server/api/v1/utils';
import { deleteGroupOccurrences } from '~/server/data/common';

export async function handleDeleteGroup(req: Request, res: Response): Promise<void> {
    const group = requiredParam(req, res, 'group');
    if (!group) {
        return;
    }
    await respond(res, () => deleteGroupOccurrences(group));
}
