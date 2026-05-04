import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useDeleteHistory } from '~/client/state/history/useDeleteHistory';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');

describe('useDeleteHistory', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls delete action with required params', async () => {
        const { result } = renderHook(() => useDeleteHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės', 22);

        expect(request).toHaveBeenCalledWith(ApiUrl.HistoryDelete, {
            time: 1234567890,
            group: 'Uogienės',
            name: 'Avietės',
            year: 22,
            user: undefined,
        });
    });

    it('calls delete action with optional user', async () => {
        const { result } = renderHook(() => useDeleteHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės', 22, 'user@email.com');

        expect(request).toHaveBeenCalledWith(ApiUrl.HistoryDelete, {
            time: 1234567890,
            group: 'Uogienės',
            name: 'Avietės',
            year: 22,
            user: 'user@email.com',
        });
    });

    it('does not call delete action with falsy time', async () => {
        const { result } = renderHook(() => useDeleteHistory(), { wrapper: MockRedux });
        await result.current(0, 'Uogienės', 'Avietės', 22);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteHistory(), { wrapper: MockRedux });
        await result.current(1234567890, '', 'Avietės', 22);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call delete action with empty name', async () => {
        const { result } = renderHook(() => useDeleteHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', '', 22);

        expect(request).not.toHaveBeenCalled();
    });
});
