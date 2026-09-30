import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { updateGroupAction } from '~/server/actions/groups';
import { useUpdateGroup } from '~/store/groups/useUpdateGroup';

vi.mock(import('~/server/actions/groups'));
vi.mock(import('~/store/groups/useGetGroups'), () => ({ useGetGroups: () => vi.fn() }));

describe('useUpdateGroup', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės');

        expect(updateGroupAction).toHaveBeenNthCalledWith(1, 'Uogienės', undefined, undefined, undefined);
    });

    it('calls update action with annual parameter', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', true);

        expect(updateGroupAction).toHaveBeenNthCalledWith(1, 'Uogienės', true, undefined, undefined);
    });

    it('calls update action with review parameter', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', true, true);

        expect(updateGroupAction).toHaveBeenNthCalledWith(1, 'Uogienės', true, true, undefined);
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('');

        expect(updateGroupAction).not.toHaveBeenCalled();
    });
});
