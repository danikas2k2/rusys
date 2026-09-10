import type { Request } from 'express';
import type { FileArray } from 'express-fileupload';

import type { ApiRequest, ApiWithFiles } from '~/common/api';

export function mockRequest<R extends Request>(body?: R['body'], files?: FileArray): R;
export function mockRequest<T extends object = object & ApiWithFiles, R extends Request = ApiRequest<T>>(
    body?: T,
    files?: FileArray
): R;
export function mockRequest<T extends object = object & ApiWithFiles, R extends Request = ApiRequest<T>>(
    body: T = {} as T,
    files?: FileArray
): R {
    if (!files && 'files' in body) {
        // eslint-disable-next-line no-param-reassign
        files = body.files as FileArray;
        delete body.files;
    }
    return { body, files } as R;
}
