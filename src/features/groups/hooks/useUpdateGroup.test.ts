import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useUpdateGroup } from '~/features/groups/hooks/useUpdateGroup';
import { trackFaroEvent } from '~/lib/observability/faro';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { updateGroupAction } from '~/server/actions/groups';

vi.mock(import('~/server/actions/groups'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/lib/utils/uploadWithProgress'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/groups/hooks/useGetGroups'), () => ({ useGetGroups: () => refresh }));

describe('useUpdateGroup', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures and reports only static failure categories', async () => {
        const error = new Error('Sensitive persistence failure for Private group');
        vi.mocked(updateGroupAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });

        await expect(result.current({ group: 'Private group', review: true })).rejects.toBe(error);

        expect(updateGroupAction).toHaveBeenCalledExactlyOnceWith({ group: 'Private group', review: true });
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'group', action: 'update', result: 'started' }],
            ['data_action', { entity: 'group', action: 'update', result: 'error' }],
        ]);
    });

    it('propagates upload failures without refreshing or exposing upload data in telemetry', async () => {
        const error = new Error('Sensitive image upload failure');
        const onProgress = vi.fn();
        vi.mocked(uploadWithProgress).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });

        await expect(
            result.current({ group: 'Private group', image: 'data:image/png;base64,PRIVATE' }, onProgress)
        ).rejects.toBe(error);

        expect(uploadWithProgress).toHaveBeenCalledTimes(1);
        expect(updateGroupAction).not.toHaveBeenCalled();
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'group', action: 'update', result: 'started' }],
            ['data_action', { entity: 'group', action: 'update', result: 'error' }],
        ]);
    });

    it('calls update action', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });
        await result.current({ group: 'Uogienės' });

        expect(updateGroupAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
        });
    });

    it('calls update action with annual parameter', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', annual: true });

        expect(updateGroupAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            annual: true,
        });
    });

    it('calls update action with review parameter', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', annual: true, review: true });

        expect(updateGroupAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            annual: true,
            review: true,
        });
    });

    it('uploads a data image with progress and refreshes the groups', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });

        await result.current(
            { group: 'New group', annual: true, review: false, image: 'data:image/png;base64,AAA' },
            onProgress
        );

        expect(uploadWithProgress).toHaveBeenCalledExactlyOnceWith(
            'PUT',
            '/api/v1/groups/New%20group',
            JSON.stringify({ annual: true, review: false, image: 'data:image/png;base64,AAA' }),
            onProgress
        );
        expect(updateGroupAction).not.toHaveBeenCalled();
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('uses the action for an existing image even with a progress callback', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });

        await result.current({ group: 'New group', image: '/image.png' }, vi.fn());

        expect(updateGroupAction).toHaveBeenCalledExactlyOnceWith({
            group: 'New group',
            image: '/image.png',
        });
        expect(uploadWithProgress).not.toHaveBeenCalled();
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });
        await result.current({ group: '' });

        expect(updateGroupAction).not.toHaveBeenCalled();
    });
});
