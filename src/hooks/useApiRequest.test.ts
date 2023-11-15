import { renderHook } from '@testing-library/react';
import { useApiRequest } from '~/hooks/useApiRequest';
import { mockFetch } from '~/tests/mockFetch';

describe('useApiRequest', () => {
    const { fetch, json } = mockFetch();

    afterEach(() => jest.clearAllMocks());

    it('sends /test api request using GET method by default, then call update with response data', async () => {
        const response = { ok: true, data: [42] };
        json.mockResolvedValueOnce(response);

        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/test')).toEqual(response);
        expect(fetch).toHaveBeenCalledWith('/test', { method: 'GET' });
    });

    it('sends / api request using POST method if some data passed', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', { test: true })).toBeUndefined();
        expect(fetch).toHaveBeenCalledWith('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"test":true}',
        });
    });

    it('sends / api request explicitly using GET method if some data passed', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', { test: true }, 'GET')).toBeUndefined();
        expect(fetch).toHaveBeenCalledWith('/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: '{"test":true}',
        });
    });

    it('sends / api request explicitly using POST method without data passed', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', 'POST')).toBeUndefined();
        expect(fetch).toHaveBeenCalledWith('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        });
    });

    it('sends / api request using HEAD method', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', 'HEAD')).toBeUndefined();
        expect(fetch).toHaveBeenCalledWith('/', {
            method: 'HEAD',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        });
    });

    it('sends / api request using GET method and wrapping string data', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', 'payload', 'GET')).toBeUndefined();
        expect(fetch).toHaveBeenCalledWith('/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: '{"data":"payload"}',
        });
    });
});
