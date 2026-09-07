import type { Request, Response } from 'express';

import { getFullSummary } from '~/server/data/summary';

export async function handleGetSummary(req: Request, res: Response): Promise<void> {
    res.json(await getFullSummary());
}
