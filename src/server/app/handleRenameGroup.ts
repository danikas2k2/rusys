import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getAllDetails } from '~/server/app/getAllDetails';
import { renameGroup } from '~/server/data/common';

export async function handleRenameGroup(req: Request, res: Response): Promise<void> {
    debug();
    debug('POST /renameGroup');
    debug(JSON.stringify(req.body, null, 2));

    const { group, newGroup } = req.body;
    const ok = await renameGroup(group, newGroup);
    if (ok) {
        await getAllDetails(req, res);
        debug('OK');
    } else {
        res.json({ ok });
        debug('FAIL');
    }
}
