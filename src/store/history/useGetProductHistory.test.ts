import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { getProductHistory } from '~/server/actions/history';
import { useGetProductHistory } from '~/store/history/useGetProductHistory';
import { setProductHistoryAction } from '~/store/products/actions';

vi.mock(import('~/server/actions/history'));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useGetProductHistory', () => {
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads the selected product history', async () => {
        const year = 22;
        const history = { updates: [], undates: [] };
        vi.mocked(getProductHistory).mockResolvedValueOnce(history);
        const { result } = renderHook(() => useGetProductHistory(year, 'Uogienės', 'Avietės'), { wrapper: MockRedux });

        await result.current();

        expect(getProductHistory).toHaveBeenCalledWith('Uogienės', 'Avietės', year);
        expect(dispatch).toHaveBeenCalledWith(setProductHistoryAction('Uogienės', 'Avietės', year, history));
    });

    it('does not request history without a selected product', async () => {
        const { result } = renderHook(() => useGetProductHistory(22), { wrapper: MockRedux });

        await result.current();

        expect(getProductHistory).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
