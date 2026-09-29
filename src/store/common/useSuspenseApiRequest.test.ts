import { renderHook } from '@testing-library/react';

import { useUpdateStateFromResponse } from '~/store/base/useUpdateStateFromResponse';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

vi.mock(import('~/store/base/useUpdateStateFromResponse'));
vi.mock(import('~/store/base/useUpdatingApiRequest'));

describe('useSuspenseApiRequest', () => {
    const update = vi.fn();

    beforeEach(() => {
        vi.mocked(useUpdateStateFromResponse).mockReturnValue(update);
        vi.mocked(useUpdatingApiRequest).mockReturnValue(vi.fn());
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('refreshes data through the server operation', async () => {
        const request = vi.fn();
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);

        const { result } = renderHook(() => useSuspenseApiRequest());
        await result.current('/api/v1/groups');

        expect(request).toHaveBeenCalledWith('/api/v1/groups', 'GET');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('fetches the initial JSON data when the server has not preloaded it', async () => {
        const data = { groups: [] };
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(data), { status: 200 }));

        const { result } = renderHook(() => useSuspenseApiRequest());
        await result.current('/api/v1/groups', true);

        expect(fetch).toHaveBeenCalledWith('/api/v1/groups');
        expect(update).toHaveBeenCalledWith(data);
    });

    it('rejects non-successful HTTP responses before updating state', async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));

        const { result } = renderHook(() => useSuspenseApiRequest());

        await expect(result.current('/api/v1/groups', true)).rejects.toThrow('503');
        expect(update).not.toHaveBeenCalled();
    });

    it('does not issue a server action while rendering an unseeded resource', async () => {
        const request = vi.fn();
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
        vi.mocked(fetch).mockRejectedValue(new TypeError('Invalid URL'));

        const { result } = renderHook(() => useSuspenseApiRequest());

        await expect(result.current('/api/v1/groups', true)).rejects.toThrow('Invalid URL');

        expect(request).not.toHaveBeenCalled();

        expect(update).not.toHaveBeenCalled();
    });

    it('propagates unrelated fetch failures', async () => {
        const failure = new TypeError('connection reset');
        vi.mocked(fetch).mockRejectedValue(failure);

        const { result } = renderHook(() => useSuspenseApiRequest());

        await expect(result.current('/api/v1/groups', true)).rejects.toBe(failure);
        expect(update).not.toHaveBeenCalled();
    });
});
