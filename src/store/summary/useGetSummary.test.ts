import { renderHook } from '@testing-library/react';

import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';
import { useGetSummary } from '~/store/summary/useGetSummary';

vi.mock(import('~/store/common/useSuspenseApiRequest'));

describe('useSummaryLoader', () => {
    const request = vi.fn();

    beforeEach(() => {
        vi.mocked(useSuspenseApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('send /summary api request for data', async () => {
        const { result } = renderHook(() => useGetSummary());

        await result.current();

        expect(request).toHaveBeenCalledWith('/api/v1/summary', undefined);
    });
});
