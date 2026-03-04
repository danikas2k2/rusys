import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useMoveHistory } from '~/client/state/history/useMoveHistory';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');

describe('useMoveHistory', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls move action with newGroup', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės', undefined, 'Daržovės');

        expect(request).toHaveBeenCalledWith(ApiUrl.HistoryMove, {
            time: 1234567890,
            group: 'Uogienės',
            name: 'Avietės',
            year: undefined,
            newGroup: 'Daržovės',
            newName: undefined,
            newYear: undefined,
        });
    });

    it('calls move action with newName', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės', 22, undefined, 'Braškės');

        expect(request).toHaveBeenCalledWith(ApiUrl.HistoryMove, {
            time: 1234567890,
            group: 'Uogienės',
            name: 'Avietės',
            year: 22,
            newGroup: undefined,
            newName: 'Braškės',
            newYear: undefined,
        });
    });

    it('calls move action with newYear', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės', 22, undefined, undefined, 23);

        expect(request).toHaveBeenCalledWith(ApiUrl.HistoryMove, {
            time: 1234567890,
            group: 'Uogienės',
            name: 'Avietės',
            year: 22,
            newGroup: undefined,
            newName: undefined,
            newYear: 23,
        });
    });

    it('does not call move action with falsy time', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(0, 'Uogienės', 'Avietės', undefined, 'Daržovės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty group', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(1234567890, '', 'Avietės', undefined, 'Daržovės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty name', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', '', undefined, 'Daržovės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action without newGroup, newName or newYear', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action when newGroup equals group', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės', undefined, 'Uogienės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action when newName equals name', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės', 22, undefined, 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action when newYear equals year', async () => {
        const { result } = renderHook(() => useMoveHistory(), { wrapper: MockRedux });
        await result.current(1234567890, 'Uogienės', 'Avietės', 22, undefined, undefined, 22);

        expect(request).not.toHaveBeenCalled();
    });
});
