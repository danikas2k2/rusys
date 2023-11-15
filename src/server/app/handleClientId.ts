import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';

export async function handleClientId(req: Request, res: Response): Promise<void> {
    debug();
    debug('GET /clientId');
    debug(JSON.stringify(req.body, null, 2));
    debug('GOOGLE_CLIENT_ID');

    const clientId = process.env.GOOGLE_CLIENT_ID;
    debug(clientId);

    res.json({
        ok: !!clientId,
        clientId,
    });
    debug(clientId ? 'OK' : "ERROR: GOOGLE_CLIENT_ID doesn't exist");
}
