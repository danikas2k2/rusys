import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { reorderGroupsAction } from '~/server/actions/groups';
import { useReorderGroups } from '~/store/groups/useReorderGroups';

vi.mock(import('~/server/actions/groups'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/store/groups/useGetGroups'), () => ({ useGetGroups: () => refresh }));

describe('useReorderGroups', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls reorder action', async () => {
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockRedux });
        const groups = { Uogienės: 3, Daržovės: 2 };
        await result.current(groups);

        expect(reorderGroupsAction).toHaveBeenNthCalledWith(1, groups);
        expect(reorderGroupsAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('does not call reorder action with empty group set', async () => {
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockRedux });
        await result.current({});

        expect(reorderGroupsAction).not.toHaveBeenCalled();
    });
});
