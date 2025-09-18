import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import { isDevMode } from '~/common/utils/env';
import { DEV_MODE_PROFILE } from '~/state/profile/dev';
import { type Profile, type WithProfileState } from '~/state/profile/types';
import { useSetProfile } from '~/state/profile/useSetProfile';

export function useProfile(): Profile {
    const setProfile = useSetProfile();
    const dev = isDevMode();
    let profile = useSelector((state: WithProfileState) => state.profile ?? {}, isEqual);
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
