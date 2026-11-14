import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useUpdateGroup } from '~/features/groups/hooks/useUpdateGroup';
import { trackFaroEvent } from '~/lib/observability/faro';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError } from '~/schema';
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

    it('propagates action failures without exposing image tokens in telemetry', async () => {
        const error = new Error('Sensitive image upload failure');
        const onProgress = vi.fn();
        vi.mocked(updateGroupAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });

        await expect(
            result.current({ group: 'Private group', image: `upload:${'b'.repeat(64)}` }, onProgress)
        ).rejects.toBe(error);

        expect(uploadWithProgress).not.toHaveBeenCalled();
        expect(updateGroupAction).toHaveBeenCalledTimes(1);
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

    it('submits an image token through the action and refreshes the groups', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });

        await result.current(
            { group: 'New group', annual: true, review: false, image: `upload:${'a'.repeat(64)}` },
            onProgress
        );

        expect(updateGroupAction).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ image: `upload:${'a'.repeat(64)}` })
        );
        expect(vi.mocked(updateGroupAction).mock.calls[0][0].image).toBe(`upload:${'a'.repeat(64)}`);
        expect(uploadWithProgress).not.toHaveBeenCalled();
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

    it('refreshes saved data and reports an unavailable image token', async () => {
        vi.mocked(updateGroupAction).mockResolvedValueOnce({ imageUnavailable: true });
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockData });

        await expect(result.current({ group: 'Fruit', image: 'upload:expired' })).rejects.toThrow(
            SchemaError.ImageUnavailable
        );
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });
});
