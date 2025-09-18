import { type Response } from 'express';

import { debug } from '~/server/api/debug';
import { type ApiResult } from '~/types/api';

export function headerNoCache(res: Response): void {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
}

export async function run<T, R extends object>(
    action: () => T | Promise<T>,
    response?: (data: T) => R | Promise<R>
): Promise<ApiResult<R>> {
    try {
        const result = await action();
        if (result || result === false) {
            debug('OK');
            return result && response
                ? { ok: true, ...(await response(result)) }
                : { ok: true, ...(typeof result === 'object' ? result : {}) };
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
