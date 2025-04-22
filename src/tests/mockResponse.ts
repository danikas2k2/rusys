import { type ApiResponse } from '~/common/api';
import { type Response } from 'express';

export function mockResponse<R extends Response>(): R;
export function mockResponse<T extends object = object, R extends Response = ApiResponse<T>>(): R;
export function mockResponse<T extends object = object, R extends Response = ApiResponse<T>>(): R {
    return { header: jest.fn(), json: jest.fn() } as unknown as R;
}
