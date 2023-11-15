import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getDetails, setDetails } from '~/server/data/details';
import { getYears } from '~/server/data/years';

export async function handleSetDetails(req: Request, res: Response): Promise<void> {
    debug();
    debug('POST /setDetails');
    debug(JSON.stringify(req.body, null, 2));

    const { group, name, details, updateWithoutHistory } = req.body;
    const ok = await setDetails(group, name, details, updateWithoutHistory);
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
