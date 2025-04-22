import { renderHook } from '@testing-library/react';
import { useApiRequest } from '~/common/hooks/useApiRequest';
import { useUpdateStateFromResponse } from '~/state/base/useUpdateStateFromResponse';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

jest.mock('~/common/hooks/useApiRequest');
jest.mock('~/state/base/useUpdateStateFromResponse');

describe('useUpdatingApiRequest', () => {
    const request = jest.fn();
    const update = jest.fn();

    beforeAll(() => {
        jest.mocked(useApiRequest).mockReturnValue(request);
        jest.mocked(useUpdateStateFromResponse).mockReturnValue(update);
    });

    afterEach(() => jest.clearAllMocks());

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
