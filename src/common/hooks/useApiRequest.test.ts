import { renderHook } from '@testing-library/react';
import axios from 'axios';
import { useApiRequest } from '~/common/hooks/useApiRequest';

jest.mock('axios', () => jest.fn().mockResolvedValue({}));

describe('useApiRequest', () => {
    afterEach(() => jest.clearAllMocks());

    it('sends /test api request using GET method by default, then call update with response data', async () => {
        const response = { ok: true, data: [42] };
        (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: response });
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/test')).toEqual(response);
        expect(axios).toHaveBeenCalledWith({ url: '/test', method: 'POST', responseType: 'json' });
    });

    it('sends / api request using POST method if some data passed', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', { test: true })).toBeUndefined();
        expect(axios).toHaveBeenCalledWith({ url: '/', method: 'POST', data: { test: true }, responseType: 'json' });
    });

    it('sends / api request explicitly using GET method if some data passed', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', { test: true }, 'GET')).toBeUndefined();
        expect(axios).toHaveBeenCalledWith({ url: '/', method: 'GET', data: { test: true }, responseType: 'json' });
    });

    it('sends / api request explicitly using POST method without data passed', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', 'POST')).toBeUndefined();
        expect(axios).toHaveBeenCalledWith({ url: '/', method: 'POST', responseType: 'json' });
    });

    it('sends / api request using HEAD method', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', 'HEAD')).toBeUndefined();
        expect(axios).toHaveBeenCalledWith({ url: '/', method: 'HEAD', responseType: 'json' });
    });

    it('sends / api request using GET method and wrapping string data', async () => {
        const { result } = renderHook(() => useApiRequest());
        expect(await result.current('/', 'payload', 'GET')).toBeUndefined();
        expect(axios).toHaveBeenCalledWith({
            url: '/',
            method: 'GET',
            data: { data: 'payload' },
            responseType: 'json',
        });
    });
});
