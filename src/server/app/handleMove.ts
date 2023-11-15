import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getAllDetails } from '~/server/app/getAllDetails';
import { move } from '~/server/data/common';

export async function handleMove(req: Request, res: Response): Promise<void> {
    debug();
    debug('POST /move');
    debug(JSON.stringify(req.body, null, 2));

    const { group, name, newGroup } = req.body;
    const ok = await move(group, name, newGroup);
    if (ok) {
        await getAllDetails(req, res);
        debug('OK');
    } else {
        res.json({ ok });
        debug('FAIL');
    }
}
