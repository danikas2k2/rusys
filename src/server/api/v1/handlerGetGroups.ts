import type { Router } from 'express';

import { getGroups } from '~/server/data/groups';

export function registerGetGroupsHandler(router: Router): void {
    router.get('/groups', async (_req, res) => res.json({ groups: await getGroups() }));
}
