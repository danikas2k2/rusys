import { renderHook } from '@testing-library/react';

import { requestData } from '~/server/actions/requestData';
import { useUpdateStateFromResponse } from '~/store/base/useUpdateStateFromResponse';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';

vi.mock(import('~/server/actions/requestData'));
vi.mock(import('~/store/base/useUpdateStateFromResponse'));

describe('useUpdatingApiRequest', () => {
    const update = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdateStateFromResponse).mockReturnValue(update);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls the server operation and updates application state', async () => {
        const response = { ok: true, data: [42] };
        vi.mocked(requestData).mockResolvedValueOnce(response);

        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/test')).resolves.toBeUndefined();
        expect(requestData).toHaveBeenCalledWith('/test', 'POST', undefined);
        expect(update).toHaveBeenCalledWith(response);
    });

    it('passes mutation data to the server', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', { test: true })).resolves.toBeUndefined();
        expect(requestData).toHaveBeenCalledWith('/', 'POST', { test: true });
    });

    it('accepts an explicit method with data', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', { test: true }, 'GET')).resolves.toBeUndefined();
        expect(requestData).toHaveBeenCalledWith('/', 'GET', { test: true });
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
