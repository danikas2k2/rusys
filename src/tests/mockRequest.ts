import { type Request } from 'express';
import { type FileArray } from 'express-fileupload';

import { type ApiRequest, type ApiWithFiles } from '~/types/api';

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
        files = body.files as FileArray;
        delete body.files;
    }
    return { body, files } as R;
}
