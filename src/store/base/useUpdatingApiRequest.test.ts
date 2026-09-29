import { renderHook } from '@testing-library/react';

import { requestData } from '~/server/actions/requestData';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';

vi.mock(import('~/server/actions/requestData'));

describe('useUpdatingApiRequest', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls the server mutation', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/test')).resolves.toBeUndefined();
        expect(requestData).toHaveBeenCalledWith('/test', 'POST', undefined);
    });

    it('passes mutation data to the server', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', { test: true })).resolves.toBeUndefined();
        expect(requestData).toHaveBeenCalledWith('/', 'POST', { test: true });
    });

    it('accepts an explicit method with data', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', { test: true }, 'PATCH')).resolves.toBeUndefined();
        expect(requestData).toHaveBeenCalledWith('/', 'PATCH', { test: true });
    });

    it('accepts a method passed as the second argument', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', 'POST')).resolves.toBeUndefined();
        expect(requestData).toHaveBeenCalledWith('/', 'POST', undefined);
    });

    it('passes other explicit methods to the server', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', 'HEAD')).resolves.toBeUndefined();
        expect(requestData).toHaveBeenCalledWith('/', 'HEAD', undefined);
    });

    it('wraps string payloads when a method is given', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', 'payload', 'POST')).resolves.toBeUndefined();
        expect(requestData).toHaveBeenCalledWith('/', 'POST', { data: 'payload' });
    });
});
