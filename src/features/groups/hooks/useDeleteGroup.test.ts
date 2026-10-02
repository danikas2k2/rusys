import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDeleteGroup } from '~/features/groups/hooks/useDeleteGroup';
import { deleteGroupAction } from '~/server/actions/groups';

vi.mock(import('~/server/actions/groups'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/groups/hooks/useGetGroups'), () => ({ useGetGroups: () => refresh }));

describe('useDeleteGroup', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls delete action', async () => {
        const { result } = renderHook(() => useDeleteGroup(), { wrapper: MockRedux });
        await result.current('Uogienės');

        expect(deleteGroupAction).toHaveBeenNthCalledWith(1, 'Uogienės');
        expect(deleteGroupAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteGroup(), { wrapper: MockRedux });
        await result.current('');

        expect(deleteGroupAction).not.toHaveBeenCalled();
    });
});
