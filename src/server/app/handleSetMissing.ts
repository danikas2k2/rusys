import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getMissing, setMissing } from '~/server/data/missing';

export async function handleSetMissing(req: Request, res: Response): Promise<void> {
    debug();
    debug('POST /setMissing');
    debug(JSON.stringify(req.body, null, 2));

    const { missing } = req.body;
    const ok = await setMissing(missing);
    if (ok) {
        res.json({
            ok,
            missing: await getMissing(),
        });
        debug('OK');
    } else {
        res.json({ ok });
        debug('FAIL');
    }
}
