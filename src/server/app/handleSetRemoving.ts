import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getRemoving, setRemoving } from '~/server/data/removing';
import { getYears } from '~/server/data/years';

export async function handleSetRemoving(req: Request, res: Response): Promise<void> {
    debug();
    debug('POST /setRemoving');
    debug(JSON.stringify(req.body, null, 2));

    const { group, name, year, removing } = req.body;
    const ok = await setRemoving(group, name, year, removing);
    if (ok) {
        const years = getYears();
        res.json({
            ok,
            years,
            removing: await getRemoving(years),
        });
        debug('OK');
    } else {
        res.json({ ok });
        debug('FAIL');
    }
}
