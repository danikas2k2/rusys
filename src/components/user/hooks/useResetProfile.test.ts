import { act, renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useIdentity } from '~/components/app/IdentityContext';
import { useResetProfile } from '~/components/user/hooks/useResetProfile';
import { CATALOG_KEYS } from '~/store/catalog';

describe('useResetProfile', () => {
    it('clears profile and cached private data on logout', () => {
        const { client, wrapper } = mockQuery({
            profile: { sub: 'user-a', allowed: true },
            groups: [{ group: 'Secret', order: 0 }],
        });
        const { result } = renderHook(() => ({ reset: useResetProfile(), profile: useIdentity().profile }), {
            wrapper,
        });
        act(() => result.current.reset());

        expect(result.current.profile.sub).toBeUndefined();
        expect(client.getQueryData(CATALOG_KEYS.groups)).toBeUndefined();
    });
});
