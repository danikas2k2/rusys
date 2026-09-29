import { renderHook } from '@testing-library/react';

import { syncUserProfile } from '~/server/actions/syncUserProfile';
import { useProfile } from '~/store/profile/useProfile';
import { useSyncUserProfile } from '~/store/profile/useSyncUserProfile';

vi.mock(import('~/server/actions/syncUserProfile'));
vi.mock(import('~/store/profile/useProfile'));

describe('useSyncUserProfile', () => {
    beforeEach(() => {
        vi.mocked(syncUserProfile).mockResolvedValue(undefined);
    });

    afterEach(() => vi.clearAllMocks());

    it('waits until Google has supplied a subject and email', () => {
        vi.mocked(useProfile).mockReturnValue({ email: 'user@example.com' });
        const { rerender } = renderHook(() => useSyncUserProfile());

        vi.mocked(useProfile).mockReturnValue({ sub: 'google-user', email: '   ' });
        rerender();

        expect(syncUserProfile).not.toHaveBeenCalled();
    });

    it('sends the profile once and resends it when its details change', () => {
        vi.mocked(useProfile).mockReturnValue({
            sub: 'google-user',
            email: ' user@example.com ',
            name: 'Alice',
            picture: 'photo.png',
        });
        const { rerender } = renderHook(() => useSyncUserProfile());

        expect(syncUserProfile).toHaveBeenCalledWith({
            email: 'user@example.com',
            name: 'Alice',
            picture: 'photo.png',
        });

        rerender();

        expect(syncUserProfile).toHaveBeenCalledTimes(1);

        vi.mocked(useProfile).mockReturnValue({
            sub: 'google-user',
            email: 'user@example.com',
            name: 'Bob',
            picture: 'photo.png',
        });
        rerender();

        expect(syncUserProfile).toHaveBeenCalledTimes(2);
        expect(syncUserProfile).toHaveBeenLastCalledWith({
            email: 'user@example.com',
            name: 'Bob',
            picture: 'photo.png',
        });
    });
});
