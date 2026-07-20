import { renderHook } from '@testing-library/react';

import { useUpdateStateFromResponse } from '~/client/state/base/useUpdateStateFromResponse';
import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useApiRequest } from '~/client/state/common/useApiRequest';

vi.mock(import('~/client/state/common/useApiRequest'));
vi.mock(import('~/client/state/base/useUpdateStateFromResponse'));

describe('useUpdatingApiRequest', () => {
    const request = vi.fn();
    const update = vi.fn();

    beforeAll(() => {
        vi.mocked(useApiRequest).mockReturnValue(request);
        vi.mocked(useUpdateStateFromResponse).mockReturnValue(update);
    });

    afterEach(() => vi.clearAllMocks());

    it('send /test api request using GET method by default, then call update with response data', async () => {
        const response = { ok: true, data: [42] };
        request.mockResolvedValueOnce(response);

        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/test')).resolves.toBeUndefined();
        expect(request).toHaveBeenCalledWith('/test');
        expect(update).toHaveBeenCalledWith(response);
    });

    it('send / api request using POST method if some data passed', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', { test: true })).resolves.toBeUndefined();
        expect(request).toHaveBeenCalledWith('/', { test: true });
    });

    it('send / api request explicitly using GET method if some data passed', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', { test: true }, 'GET')).resolves.toBeUndefined();
        expect(request).toHaveBeenCalledWith('/', { test: true }, 'GET');
    });

    it('send / api request explicitly using POST method without data passed', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', 'POST')).resolves.toBeUndefined();
        expect(request).toHaveBeenCalledWith('/', 'POST');
    });

    it('send / api request using HEAD method', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());

        await expect(result.current('/', 'HEAD')).resolves.toBeUndefined();
        expect(request).toHaveBeenCalledWith('/', 'HEAD');
    });
});
