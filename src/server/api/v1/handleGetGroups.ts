import type { Request, Response } from 'express';

import { getGroups } from '~/server/data/groups';

export async function handleGetGroups(req: Request, res: Response): Promise<void> {
    res.json({ groups: await getGroups() });
}
