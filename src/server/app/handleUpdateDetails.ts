import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getDetails, updateDetails } from '~/server/data/details';
import { getYears } from '~/server/data/years';

export async function handleUpdateDetails(req: Request, res: Response): Promise<void> {
    debug();
    debug('POST /updateDetails');
    debug(JSON.stringify(req.body, null, 2));

    const { name, year, value, updateWithoutHistory } = req.body;
    const ok = await updateDetails(name, year, value, updateWithoutHistory);
    if (ok) {
        const years = getYears();
        res.json({
            ok,
            years,
            details: await getDetails(years),
        });
        debug('OK');
    } else {
        res.json({ ok });
        debug('FAIL');
    }
}
