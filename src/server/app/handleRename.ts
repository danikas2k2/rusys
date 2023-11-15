import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getAllDetails } from '~/server/app/getAllDetails';
import { rename } from '~/server/data/common';

export async function handleRename(req: Request, res: Response): Promise<void> {
    debug();
    debug('POST /rename');
    debug(JSON.stringify(req.body, null, 2));

    const { group, name, newName } = req.body;
    const ok = await rename(group, name, newName);
    if (ok) {
        await getAllDetails(req, res);
        debug('OK');
    } else {
        res.json({ ok });
        debug('FAIL');
    }
}
