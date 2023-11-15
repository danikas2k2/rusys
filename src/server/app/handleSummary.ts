import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getSummary } from '~/server/data/updates';
import { getYears } from '~/server/data/years';

export async function handleSummary(_req: Request, res: Response): Promise<void> {
    debug();
    debug('GET /summary');

    const years = getYears();
    res.json({
        ok: true,
        years,
        summary: await getSummary(years),
    });
    debug('OK');
}
