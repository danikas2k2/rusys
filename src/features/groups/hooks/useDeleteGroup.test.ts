import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useDeleteGroup } from '~/features/groups/hooks/useDeleteGroup';
import { trackFaroEvent } from '~/lib/observability/faro';
import { deleteGroupAction } from '~/server/actions/groups';

vi.mock(import('~/server/actions/groups'));
vi.mock(import('~/lib/observability/faro'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/groups/hooks/useGetGroups'), () => ({ useGetGroups: () => refresh }));

describe('useDeleteGroup', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures and reports only static failure categories', async () => {
        const error = new Error('Sensitive persistence failure for Private group');
        vi.mocked(deleteGroupAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useDeleteGroup(), { wrapper: MockData });

        await expect(result.current({ group: 'Private group' })).rejects.toBe(error);

        expect(deleteGroupAction).toHaveBeenCalledExactlyOnceWith({ group: 'Private group' });
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'group', action: 'delete', result: 'started' }],
            ['data_action', { entity: 'group', action: 'delete', result: 'error' }],
        ]);
    });

    it('calls delete action', async () => {
        const { result } = renderHook(() => useDeleteGroup(), { wrapper: MockData });
        await result.current({ group: 'Uogienės' });

        expect(deleteGroupAction).toHaveBeenNthCalledWith(1, { group: 'Uogienės' });
        expect(deleteGroupAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteGroup(), { wrapper: MockData });
        await result.current({ group: '' });

        expect(deleteGroupAction).not.toHaveBeenCalled();
    });
});
