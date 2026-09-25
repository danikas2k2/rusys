import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { API } from '~/common/api/v1';
import { useApiRequest } from '~/store/common/useApiRequest';
import { useGetProductHistory } from '~/store/history/useGetProductHistory';
import { setProductHistoryAction } from '~/store/products/actions';

vi.mock(import('~/store/common/useApiRequest'));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useGetProductHistory', () => {
    const request = vi.fn();
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useApiRequest).mockReturnValue(request);
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads the selected product history', async () => {
        const year = 22;
        const history = { updates: [], undates: [] };
        request.mockResolvedValueOnce(history);
        const { result } = renderHook(() => useGetProductHistory(year, 'Uogienės', 'Avietės'), { wrapper: MockRedux });

        await result.current();

        expect(request).toHaveBeenCalledWith(API.productHistory('Uogienės', 'Avietės', year), 'GET');
        expect(dispatch).toHaveBeenCalledWith(setProductHistoryAction('Uogienės', 'Avietės', year, history));
    });

    it('does not request history without a selected product', async () => {
        const { result } = renderHook(() => useGetProductHistory(22), { wrapper: MockRedux });

        await result.current();

        expect(request).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
