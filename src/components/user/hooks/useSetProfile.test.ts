import { act, renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useSetProfile } from '~/components/user/hooks/useSetProfile';
import { useProfile } from '~/store/profile';

describe('useSetProfile', () => {
    it('updates the current profile', () => {
        const { wrapper } = mockQuery();
        const { result } = renderHook(() => ({ set: useSetProfile(), profile: useProfile() }), { wrapper });
        const profile = { sub: 'user-a', name: 'Test User', email: 'test.user@email.com' };
        act(() => result.current.set(profile));

        expect(result.current.profile).toStrictEqual(profile);
    });
});
