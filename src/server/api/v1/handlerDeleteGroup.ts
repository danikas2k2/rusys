import type { Router } from 'express';

import { requiredParam, respond } from '~/server/api/v1/utils';
import { deleteGroupOccurrences } from '~/server/data/common';

export function registerDeleteGroupHandler(router: Router): void {
    router.delete('/groups/:group', async (req, res) => {
        const group = requiredParam(req, res, 'group');
        if (!group) {
            return;
        }
        await respond(res, () => deleteGroupOccurrences(group));
    });
}
