import { type Request, type Response } from 'express';
import { debug } from '~/server/app/debug';

export async function handleCheckUser(req: Request, res: Response): Promise<void> {
    debug();
    debug('GET /checkUser');
    debug(JSON.stringify(req.body, null, 2));
    debug('GOOGLE_ALLOWED_USERS');

    const allowedUsers = process.env.GOOGLE_ALLOWED_USERS;
    debug(allowedUsers);

    const { email } = req.body;
    res.json({
        ok: !!email,
        email,
        allowed: allowedUsers?.split(',').includes(email) || process.env.DEV_MODE === 'true' || false,
    });
    debug(allowedUsers ? 'OK' : "ERROR: GOOGLE_ALLOWED_USERS doesn't exist");
}
