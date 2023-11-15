import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getAllDetails } from '~/server/app/getAllDetails';
import { remove } from '~/server/data/common';

export async function handleRemove(req: Request, res: Response): Promise<void> {
    debug();
    debug('POST /remove');
    debug(JSON.stringify(req.body, null, 2));

    const { group, name } = req.body;
    const ok = await remove(group, name);
    if (ok) {
        await getAllDetails(req, res);
        debug('OK');
    } else {
        res.json({ ok });
        debug('FAIL');
    }
}
