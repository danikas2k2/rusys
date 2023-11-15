import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getAllDetails } from '~/server/app/getAllDetails';
import { removeGroup } from '~/server/data/common';

export async function handleRemoveGroup(req: Request, res: Response): Promise<void> {
    debug();
    debug('POST /removeGroup');
    debug(JSON.stringify(req.body, null, 2));

    const { group } = req.body;
    const ok = await removeGroup(group);
    if (ok) {
        await getAllDetails(req, res);
        debug('OK');
    } else {
        res.json({ ok });
        debug('FAIL');
    }
}
