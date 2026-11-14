import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useRenameGroup } from '~/features/groups/hooks/useRenameGroup';
import { trackFaroEvent } from '~/lib/observability/faro';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError } from '~/schema';
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

    it('propagates action failures without exposing image tokens in telemetry', async () => {
        const error = new Error('Sensitive image upload failure');
        const onProgress = vi.fn();
        vi.mocked(renameGroupAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });

        await expect(
            result.current(
                { group: 'Private group', targetGroup: 'Private target', image: `upload:${'b'.repeat(64)}` },
                onProgress
            )
        ).rejects.toBe(error);

        expect(uploadWithProgress).not.toHaveBeenCalled();
        expect(renameGroupAction).toHaveBeenCalledTimes(1);
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

    it('submits an image token through the action and refreshes the groups', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });

        await result.current(
            {
                group: 'Old group',
                targetGroup: 'New group',
                annual: true,
                review: false,
                image: `upload:${'a'.repeat(64)}`,
            },
            onProgress
        );

        expect(renameGroupAction).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ image: `upload:${'a'.repeat(64)}` })
        );
        expect(vi.mocked(renameGroupAction).mock.calls[0][0].image).toBe(`upload:${'a'.repeat(64)}`);
        expect(uploadWithProgress).not.toHaveBeenCalled();
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

    it('refreshes saved data and reports an unavailable image token', async () => {
        vi.mocked(renameGroupAction).mockResolvedValueOnce({ imageUnavailable: true });
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockData });

        await expect(
            result.current({ group: 'Fruit', targetGroup: 'New Fruit', image: 'upload:expired' })
        ).rejects.toThrow(SchemaError.ImageUnavailable);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });
});
