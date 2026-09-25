import { renderHook } from '@testing-library/react';

import { useUpdateStateFromResponse } from '~/store/base/useUpdateStateFromResponse';
import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

vi.mock(import('~/store/base/useUpdateStateFromResponse'));

describe('useSuspenseApiRequest', () => {
    const update = vi.fn();

    beforeEach(() => {
        vi.mocked(useUpdateStateFromResponse).mockReturnValue(update);
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('fetches JSON data and updates application state', async () => {
        const data = { groups: [] };
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(data), { status: 200 }));

        const { result } = renderHook(() => useSuspenseApiRequest());
        await result.current('/api/v1/groups');

        expect(fetch).toHaveBeenCalledWith('/api/v1/groups');
        expect(update).toHaveBeenCalledWith(data);
    });

    it('rejects non-successful HTTP responses before updating state', async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));

        const { result } = renderHook(() => useSuspenseApiRequest());

        await expect(result.current('/api/v1/groups')).rejects.toThrow('503');
        expect(update).not.toHaveBeenCalled();
    });
});
