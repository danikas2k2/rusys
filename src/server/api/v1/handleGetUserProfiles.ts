import type { Request, Response } from 'express';

import { getUserProfiles } from '~/server/data/userProfiles';

export async function handleGetUserProfiles(req: Request, res: Response): Promise<void> {
    const emails = (Array.isArray(req.query.email) ? req.query.email : [req.query.email]).filter(
        (email): email is string => typeof email === 'string'
    );
    res.json({ profiles: await getUserProfiles(emails) });
}
