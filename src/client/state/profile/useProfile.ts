import { isDevMode } from '@rusys/common/utils/dev';
import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import { DEV_MODE_PROFILE } from '~/client/state/profile/dev';
import type { Profile, WithProfileState } from '~/client/state/profile/types';
import { useSetProfile } from '~/client/state/profile/useSetProfile';

export function useProfile(): Profile {
    const setProfile = useSetProfile();
    const dev = isDevMode();
    let profile = useSelector((state: WithProfileState) => state.profile ?? {}, equal);
    if (!profile.sub) {
        profile = JSON.parse(localStorage.getItem('profile') ?? '{}') ?? {};
        if (!profile.sub && dev) {
            profile = DEV_MODE_PROFILE;
        }
        if (profile.sub) {
            setProfile(profile);
        }
    }
    return profile;
}
