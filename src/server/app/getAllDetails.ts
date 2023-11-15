import { type Request, type Response } from 'express';
import { getDetails } from '~/server/data/details';
import { getMissing } from '~/server/data/missing';
import { getRemoving } from '~/server/data/removing';
import { getYears } from '~/server/data/years';

export async function getAllDetails(_req: Request, res: Response): Promise<void> {
    const years = getYears();
    res.json({
        ok: true,
        years,
        details: await getDetails(years),
        removing: await getRemoving(years),
        missing: await getMissing(),
    });
}
