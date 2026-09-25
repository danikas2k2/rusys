import equal from 'fast-deep-equal/es6/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { isDevMode } from '~/common/utils/dev';
import { DEV_MODE_PROFILE } from '~/store/profile/dev';
import type { Profile, WithProfileState } from '~/store/profile/types';
import { useSetProfile } from '~/store/profile/useSetProfile';

export function useProfile(): Profile {
    const setProfile = useSetProfile();
    const dev = isDevMode();
    const profile = useSelector((state: WithProfileState) => state.profile ?? {}, equal);
    const [storedProfile] = useState<Profile>(() => {
        let savedProfile = JSON.parse(localStorage.getItem('profile') ?? '{}') ?? {};
        if (!savedProfile.sub && dev) {
            savedProfile = DEV_MODE_PROFILE;
        }
        return savedProfile;
    });

    useEffect(() => {
        if (profile.sub) {
            return;
        }
        if (storedProfile.sub) {
            setProfile(storedProfile);
        }
    }, [profile.sub, setProfile, storedProfile]);

    return profile.sub ? profile : storedProfile;
}
