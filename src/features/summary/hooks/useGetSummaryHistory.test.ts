import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { useGetSummaryHistory } from '~/features/summary/hooks/useGetSummaryHistory';
import { getSummaryHistory } from '~/server/actions/summary';
import { setSummaryHistoryAction } from '~/store/summary';

vi.mock(import('~/server/actions/summary'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useGetSummaryHistory', () => {
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads the selected product summary history', async () => {
        const year = 25;
        const history = { updates: [], undates: [] };
        vi.mocked(getSummaryHistory).mockResolvedValueOnce(history);
        const { result } = renderHook(() => useGetSummaryHistory(year, 'Uogienės', 'Avietės'), {
            wrapper: MockRedux,
        });
        await result.current();

        expect(getSummaryHistory).toHaveBeenCalledWith('Uogienės', 'Avietės', year);
        expect(dispatch).toHaveBeenCalledWith(
            setSummaryHistoryAction({ group: 'Uogienės', name: 'Avietės', year, history })
        );
    });

    it('does not request history when group and name are undefined', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25), { wrapper: MockRedux });
        await result.current();

        expect(getSummaryHistory).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('does not request history when name is omitted', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25, 'Uogienės'), {
            wrapper: MockRedux,
        });
        await result.current();

        expect(getSummaryHistory).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
