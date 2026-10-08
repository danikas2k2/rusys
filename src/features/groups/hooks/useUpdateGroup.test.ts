import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdateGroup } from '~/features/groups/hooks/useUpdateGroup';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { updateGroupAction } from '~/server/actions/groups';

vi.mock(import('~/server/actions/groups'));
vi.mock(import('~/lib/utils/uploadWithProgress'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/groups/hooks/useGetGroups'), () => ({ useGetGroups: () => refresh }));

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

    it('uploads a data image with progress and refreshes the groups', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });

        await result.current('New group', true, false, 'data:image/png;base64,AAA', onProgress);

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
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });

        await result.current('New group', undefined, undefined, '/image.png', vi.fn());

        expect(updateGroupAction).toHaveBeenCalledExactlyOnceWith('New group', undefined, undefined, '/image.png');
        expect(uploadWithProgress).not.toHaveBeenCalled();
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('');

        expect(updateGroupAction).not.toHaveBeenCalled();
    });
});
