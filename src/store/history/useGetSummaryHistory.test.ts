import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { API } from '~/common/api/v1';
import { useApiRequest } from '~/store/common/useApiRequest';
import { useGetSummaryHistory } from '~/store/history/useGetSummaryHistory';
import { setSummaryHistoryAction } from '~/store/summary/actions';

vi.mock(import('~/store/common/useApiRequest'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useGetSummaryHistory', () => {
    const request = vi.fn();
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useApiRequest).mockReturnValue(request);
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads the selected product summary history', async () => {
        const year = 25;
        const history = { updates: [], undates: [] };
        request.mockResolvedValueOnce(history);
        const { result } = renderHook(() => useGetSummaryHistory(year, 'Uogienės', 'Avietės'), {
            wrapper: MockRedux,
        });
        await result.current();

        expect(request).toHaveBeenCalledWith(API.summaryHistory('Uogienės', 'Avietės', year), 'GET');
        expect(dispatch).toHaveBeenCalledWith(setSummaryHistoryAction('Uogienės', 'Avietės', year, history));
    });

    it('does not request history when group and name are undefined', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25), { wrapper: MockRedux });
        await result.current();

        expect(request).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('does not request history when name is omitted', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25, 'Uogienės'), {
            wrapper: MockRedux,
        });
        await result.current();

        expect(request).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
