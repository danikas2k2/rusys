import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useUpdateHistory } from '~/client/state/history/useUpdateHistory';
import { ApiUrl } from '~/types/api';
import type { VariantAmount } from '~/types/data';

jest.mock('~/client/state/base/useUpdatingApiRequest');

describe('useUpdateHistory', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action with required params', async () => {
        const { result } = renderHook(() => useUpdateHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės');

        expect(request).toHaveBeenCalledWith(ApiUrl.HistoryUpdate, {
            time: 1234567890,
            group: 'Uogienės',
            name: 'Avietės',
            year: undefined,
            amounts: undefined,
            user: undefined,
        });
    });

    it('calls update action with optional year, amounts and user', async () => {
        const amounts: VariantAmount[] = [{ variant: 'p', amount: 2 }];
        const { result } = renderHook(() => useUpdateHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės', 22, amounts, 'user@email.com');

        expect(request).toHaveBeenCalledWith(ApiUrl.HistoryUpdate, {
            time: 1234567890,
            group: 'Uogienės',
            name: 'Avietės',
            year: 22,
            amounts,
            user: 'user@email.com',
        });
    });

    it('does not call update action with falsy time', async () => {
        const { result } = renderHook(() => useUpdateHistory(), { wrapper: MockRedux });
        await result.current(0, 'Uogienės', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateHistory(), { wrapper: MockRedux });
        await result.current(1234567890, '', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with empty name', async () => {
        const { result } = renderHook(() => useUpdateHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', '');

        expect(request).not.toHaveBeenCalled();
    });
});
