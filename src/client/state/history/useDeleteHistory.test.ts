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
        await result.current(1234567890, 'Uogienės', 'Avietės');

        expect(request).toHaveBeenCalledWith(ApiUrl.HistoryDelete, {
            time: 1234567890,
            group: 'Uogienės',
            name: 'Avietės',
            year: undefined,
            user: undefined,
        });
    });

    it('calls delete action with optional year and user', async () => {
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
        await result.current(0, 'Uogienės', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteHistory(), { wrapper: MockRedux });
        await result.current(1234567890, '', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call delete action with empty name', async () => {
        const { result } = renderHook(() => useDeleteHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', '');

        expect(request).not.toHaveBeenCalled();
    });
});
