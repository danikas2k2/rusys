import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetSummaryHistory } from '~/client/state/history/useGetSummaryHistory';
import { ApiUrl } from '~/types/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useGetSummaryHistory', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls request with ApiUrl.SummaryHistory and full payload', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25, 'Uogienės', 'Avietės'), {
            wrapper: MockRedux,
        });
        await result.current();

        expect(request).toHaveBeenCalledWith(ApiUrl.SummaryHistory, {
            year: 25,
            group: 'Uogienės',
            name: 'Avietės',
        });
    });

    it('calls request with only year when group and name are undefined', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25), { wrapper: MockRedux });
        await result.current();

        expect(request).toHaveBeenCalledWith(ApiUrl.SummaryHistory, {
            year: 25,
            group: undefined,
            name: undefined,
        });
    });

    it('calls request with year and group when name is omitted', async () => {
        const { result } = renderHook(() => useGetSummaryHistory(25, 'Uogienės'), {
            wrapper: MockRedux,
        });
        await result.current();

        expect(request).toHaveBeenCalledWith(ApiUrl.SummaryHistory, {
            year: 25,
            group: 'Uogienės',
            name: undefined,
        });
    });
});
