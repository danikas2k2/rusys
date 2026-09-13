import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { API } from '@rusys/common/api/v1';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetSummaryHistory } from '~/client/state/history/useGetSummaryHistory';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useGetSummaryHistory', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads the selected product summary history', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25, 'Uogienės', 'Avietės'), {
            wrapper: MockRedux,
        });
        await result.current();

        expect(request).toHaveBeenCalledWith(API.summaryHistory('Uogienės', 'Avietės', 25), undefined, 'GET');
    });

    it('does not request history when group and name are undefined', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25), { wrapper: MockRedux });
        await result.current();

        expect(request).not.toHaveBeenCalled();
    });

    it('does not request history when name is omitted', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25, 'Uogienės'), {
            wrapper: MockRedux,
        });
        await result.current();

        expect(request).not.toHaveBeenCalled();
    });
});
