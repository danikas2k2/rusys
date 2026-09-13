import type { Router } from 'express';

import { getUserProfiles } from '~/server/data/userProfiles';

export function registerGetUserProfilesHandler(router: Router): void {
    router.get('/user-profiles', async (req, res) => {
        const emails = (Array.isArray(req.query.email) ? req.query.email : [req.query.email]).filter(
            (email): email is string => typeof email === 'string'
        );
        res.json({ profiles: await getUserProfiles(emails) });
    });
}
