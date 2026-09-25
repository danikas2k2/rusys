import { renderHook } from '@testing-library/react';

import { API } from '@rusys/common/api/v1';

import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';
import { useGetProductHistory } from '~/store/history/useGetProductHistory';

vi.mock(import('~/store/common/useSuspenseApiRequest'));

describe('useGetProductHistory', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useSuspenseApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads the selected product history', async () => {
        const year = 22;
        const { result } = renderHook(() => useGetProductHistory(year, 'Uogienės', 'Avietės'));

        await result.current();

        expect(request).toHaveBeenCalledWith(API.productHistory('Uogienės', 'Avietės', year));
    });

    it('does not request history without a selected product', async () => {
        const { result } = renderHook(() => useGetProductHistory(22));

        await result.current();

        expect(request).not.toHaveBeenCalled();
    });
});
