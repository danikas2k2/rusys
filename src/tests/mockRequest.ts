import { type Request } from 'express';
import { type ApiRequest } from '~/common/api';

export function mockRequest<R extends Request>(body?: R['body']): R;
export function mockRequest<T extends object = object, R extends Request = ApiRequest<T>>(body?: T): R;
export function mockRequest<T extends object = object, R extends Request = ApiRequest<T>>(body: T = {} as T): R {
    return { body } as R;
}
