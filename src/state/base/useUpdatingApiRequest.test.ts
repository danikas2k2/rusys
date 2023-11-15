import { renderHook } from '@testing-library/react';
import { useApiRequest } from '~/hooks/useApiRequest';
import { useUpdateStateFromResponse } from '~/state/base/useUpdateStateFromResponse';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

jest.mock('~/hooks/useApiRequest');
jest.mock('~/state/base/useUpdateStateFromResponse');

describe('useUpdatingApiRequest', () => {
    const request = jest.fn();
    const update = jest.fn();

    beforeAll(() => {
        (useApiRequest as jest.Mock).mockReturnValue(request);
        (useUpdateStateFromResponse as jest.Mock).mockReturnValue(update);
    });

    afterEach(() => jest.clearAllMocks());

    it('send /test api request using GET method by default, then call update with response data', async () => {
        const response = { ok: true, data: [42] };
        request.mockResolvedValueOnce(response);

        const { result } = renderHook(() => useUpdatingApiRequest());
        expect(await result.current('/test')).toBeUndefined();
        expect(request).toHaveBeenCalledWith('/test');
        expect(update).toHaveBeenCalledWith(response);
    });

    it('send / api request using POST method if some data passed', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());
        expect(await result.current('/', { test: true })).toBeUndefined();
        expect(request).toHaveBeenCalledWith('/', { test: true });
    });

    it('send / api request explicitly using GET method if some data passed', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());
        expect(await result.current('/', { test: true }, 'GET')).toBeUndefined();
        expect(request).toHaveBeenCalledWith('/', { test: true }, 'GET');
    });

    it('send / api request explicitly using POST method without data passed', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());
        expect(await result.current('/', 'POST')).toBeUndefined();
        expect(request).toHaveBeenCalledWith('/', 'POST');
    });

    it('send / api request using HEAD method', async () => {
        const { result } = renderHook(() => useUpdatingApiRequest());
        expect(await result.current('/', 'HEAD')).toBeUndefined();
        expect(request).toHaveBeenCalledWith('/', 'HEAD');
    });
});
