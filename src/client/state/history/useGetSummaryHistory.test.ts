import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetSummaryHistory } from '~/client/state/history/useGetSummaryHistory';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({ ...jest.requireActual('react-redux'), useDispatch: jest.fn() }));

describe('useGetSummaryHistory', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

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
