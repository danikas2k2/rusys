import type { ApiResult } from '@rusys/common/api';
import type { Response } from 'express';

import { debug } from '~/server/api/debug';

export function headerNoCache(res: Response): void {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
}

export async function run<T, R = unknown>(
    action: () => T | Promise<T>,
    response?: (data: T) => R | Promise<R>
): Promise<ApiResult<R>> {
    try {
        const result = await action();
        if (result || result === false) {
            debug('OK');
            return {
                ok: true,
                ...((result && response ? await response(result) : typeof result === 'object' ? result : {}) as R),
            };
        }
        debug('FAIL');
        return { ok: false };
    } catch (e) {
        debug('ERROR', e);
        return {
            ok: false,
            error: `${e}`,
        };
    }
}
