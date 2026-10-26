import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useReorderGroups } from '~/features/groups/hooks/useReorderGroups';
import { trackFaroEvent } from '~/lib/observability/faro';
import { reorderGroupsAction } from '~/server/actions/groups';

vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/server/actions/groups'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/groups/hooks/useGetGroups'), () => ({ useGetGroups: () => refresh }));

describe('useReorderGroups', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls reorder action', async () => {
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockData });
        const groups = { Uogienės: 3, Daržovės: 2 };
        await result.current({ groups });

        expect(reorderGroupsAction).toHaveBeenNthCalledWith(1, { groups });
        expect(reorderGroupsAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
        expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('list_reordered', { list: 'groups', result: 'success' });
    });

    it('does not call reorder action with empty group set', async () => {
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockData });
        await result.current({ groups: {} });

        expect(reorderGroupsAction).not.toHaveBeenCalled();
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });

    it('records a failed reorder without reporting success or refreshing', async () => {
        vi.mocked(reorderGroupsAction).mockRejectedValueOnce(new Error('private error'));
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockData });

        await expect(result.current({ groups: { private: 1 } })).rejects.toThrow('private error');
        expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('list_reordered', { list: 'groups', result: 'error' });
        expect(refresh).not.toHaveBeenCalled();
    });
});
