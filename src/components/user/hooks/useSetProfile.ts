import { useCallback } from 'react';

import { useIdentity } from '~/components/app/IdentityContext';
import type { Profile } from '~/store/profile/types';

export function useSetProfile(): (profile: Profile) => void {
    const { setProfile } = useIdentity();
    return useCallback((profile: Profile) => setProfile(profile), [setProfile]);
}
