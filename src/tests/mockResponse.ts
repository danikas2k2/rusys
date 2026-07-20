import type { Response } from 'express';
import { vi } from 'vitest';

import type { ApiResponse } from '~/types/api';

export function mockResponse<R extends Response>(): R;
export function mockResponse<T extends object = object, R extends Response = ApiResponse<T>>(): R;
export function mockResponse<T extends object = object, R extends Response = ApiResponse<T>>(): R {
    return { header: vi.fn(), json: vi.fn() } as unknown as R;
}
