import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { renameGroupAction } from '~/server/actions/groups';
import { useRenameGroup } from '~/store/groups/useRenameGroup';

vi.mock(import('~/server/actions/groups'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/store/groups/useGetGroups'), () => ({ useGetGroups: () => refresh }));

describe('useRenameGroup', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Daržovės');

        expect(renameGroupAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Daržovės', undefined, undefined, undefined);
        expect(renameGroupAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('calls rename action with annual and review parameters', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Daržovės', true, true);

        expect(renameGroupAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Daržovės', true, true, undefined);
    });

    it.each`
        title                | group         | newGroup
        ${'same group'}      | ${'Uogienės'} | ${'Uogienės'}
        ${'empty group'}     | ${''}         | ${'Šaldytos'}
        ${'empty new group'} | ${'Uogienės'} | ${''}
    `('does not call rename action with $title', async ({ group, newGroup }: { group: string; newGroup: string }) => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current(group, newGroup);

        expect(renameGroupAction).not.toHaveBeenCalled();
    });
});
