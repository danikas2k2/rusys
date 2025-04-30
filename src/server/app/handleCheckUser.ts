import { type ApiRequest, type ApiResponse, type ApiUserAllowed, type ApiUserEmail } from '~/common/api';
import { isDevMode } from '~/common/utils/env';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';

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
