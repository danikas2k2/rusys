import { isDevMode } from '~/common/utils/env';
import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import type { ApiRequest, ApiResponse, ApiUserAllowed, ApiUserEmail } from '~/types/api';

export async function handleCheckUser(req: ApiRequest<ApiUserEmail>, res: ApiResponse<ApiUserAllowed>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const allowedUsers = process.env.GOOGLE_ALLOWED_USERS;
    const { email } = req.body;
    res.json(
        await run(
            () => allowedUsers?.split(',').includes(email) || isDevMode() || false,
            (allowed) => ({ allowed })
        )
    );
}
