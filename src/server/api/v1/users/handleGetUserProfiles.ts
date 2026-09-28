import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { getUserProfiles } from '~/server/data/userProfiles';

export async function handleGetUserProfiles(req: ApiRequest, res: ApiResponse): Promise<void> {
    const emails = (Array.isArray(req.query.email) ? req.query.email : [req.query.email]).filter(
        (email): email is string => typeof email === 'string'
    );
    res.json({ profiles: await getUserProfiles(emails) });
}
