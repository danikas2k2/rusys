import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useRenameGroup } from '~/features/groups/hooks/useRenameGroup';
import { trackFaroEvent } from '~/lib/observability/faro';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { renameGroupAction } from '~/server/actions/groups';

vi.mock(import('~/server/actions/groups'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/lib/utils/uploadWithProgress'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/groups/hooks/useGetGroups'), () => ({ useGetGroups: () => refresh }));

describe('useRenameGroup', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures and reports only static failure categories', async () => {
        const error = new Error('Sensitive persistence failure for Private group');
        vi.mocked(renameGroupAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });

        await expect(result.current({ group: 'Private group', targetGroup: 'Private target' })).rejects.toBe(error);

        expect(renameGroupAction).toHaveBeenCalledExactlyOnceWith({
            group: 'Private group',
            targetGroup: 'Private target',
        });
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'group', action: 'rename', result: 'started' }],
            ['data_action', { entity: 'group', action: 'rename', result: 'error' }],
        ]);
    });

    it('propagates upload failures without refreshing or exposing upload data in telemetry', async () => {
        const error = new Error('Sensitive image upload failure');
        const onProgress = vi.fn();
        vi.mocked(uploadWithProgress).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });

        await expect(
            result.current(
                { group: 'Private group', targetGroup: 'Private target', image: 'data:image/png;base64,PRIVATE' },
                onProgress
            )
        ).rejects.toBe(error);

        expect(uploadWithProgress).toHaveBeenCalledTimes(1);
        expect(renameGroupAction).not.toHaveBeenCalled();
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'group', action: 'rename', result: 'started' }],
            ['data_action', { entity: 'group', action: 'rename', result: 'error' }],
        ]);
    });

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', targetGroup: 'Daržovės' });

        expect(renameGroupAction).toHaveBeenNthCalledWith(1, { group: 'Uogienės', targetGroup: 'Daržovės' });
        expect(renameGroupAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('calls rename action with annual and review parameters', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', targetGroup: 'Daržovės', annual: true, review: true });

        expect(renameGroupAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            targetGroup: 'Daržovės',
            annual: true,
            review: true,
        });
    });

    it('uploads a data image with progress and refreshes the groups', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });

        await result.current(
            {
                group: 'Old group',
                targetGroup: 'New group',
                annual: true,
                review: false,
                image: 'data:image/png;base64,AAA',
            },
            onProgress
        );

        expect(uploadWithProgress).toHaveBeenCalledExactlyOnceWith(
            'PATCH',
            '/api/v1/groups/Old%20group',
            JSON.stringify({
                targetGroup: 'New group',
                annual: true,
                review: false,
                image: 'data:image/png;base64,AAA',
            }),
            onProgress
        );
        expect(renameGroupAction).not.toHaveBeenCalled();
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('uses the action for an existing image even with a progress callback', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });

        await result.current({ group: 'Old group', targetGroup: 'New group', image: '/image.png' }, vi.fn());

        expect(renameGroupAction).toHaveBeenCalledExactlyOnceWith({
            group: 'Old group',
            targetGroup: 'New group',
            image: '/image.png',
        });
        expect(uploadWithProgress).not.toHaveBeenCalled();
    });

    it.each`
        title                | group         | newGroup
        ${'same group'}      | ${'Uogienės'} | ${'Uogienės'}
        ${'empty group'}     | ${''}         | ${'Šaldytos'}
        ${'empty new group'} | ${'Uogienės'} | ${''}
    `('does not call rename action with $title', async ({ group, newGroup }: { group: string; newGroup: string }) => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });
        await result.current({ group, targetGroup: newGroup });

        expect(renameGroupAction).not.toHaveBeenCalled();
    });
});
