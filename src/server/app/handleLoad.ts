import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';
import { getAllDetails } from '~/server/app/getAllDetails';

export async function handleLoad(req: Request, res: Response): Promise<void> {
    debug();
    debug('GET /load');

    await getAllDetails(req, res);
    debug('OK');
}
