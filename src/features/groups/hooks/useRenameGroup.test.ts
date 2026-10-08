import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useRenameGroup } from '~/features/groups/hooks/useRenameGroup';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { renameGroupAction } from '~/server/actions/groups';

vi.mock(import('~/server/actions/groups'));
vi.mock(import('~/lib/utils/uploadWithProgress'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/groups/hooks/useGetGroups'), () => ({ useGetGroups: () => refresh }));

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

    it('uploads a data image with progress and refreshes the groups', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });

        await result.current('Old group', 'New group', true, false, 'data:image/png;base64,AAA', onProgress);

        expect(uploadWithProgress).toHaveBeenCalledExactlyOnceWith(
            'PATCH',
            '/api/v1/groups/Old%20group',
            JSON.stringify({ name: 'New group', annual: true, review: false, image: 'data:image/png;base64,AAA' }),
            onProgress
        );
        expect(renameGroupAction).not.toHaveBeenCalled();
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('uses the action for an existing image even with a progress callback', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });

        await result.current('Old group', 'New group', undefined, undefined, '/image.png', vi.fn());

        expect(renameGroupAction).toHaveBeenCalledExactlyOnceWith(
            'Old group',
            'New group',
            undefined,
            undefined,
            '/image.png'
        );
        expect(uploadWithProgress).not.toHaveBeenCalled();
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
