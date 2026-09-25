import { isDevMode } from '@rusys/common/utils/dev';
import equal from 'fast-deep-equal/es6/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { DEV_MODE_PROFILE } from '~/store/profile/dev';
import type { Profile, WithProfileState } from '~/store/profile/types';
import { useSetProfile } from '~/store/profile/useSetProfile';

export function useProfile(): Profile {
    const setProfile = useSetProfile();
    const dev = isDevMode();
    const profile = useSelector((state: WithProfileState) => state.profile ?? {}, equal);
    const [storedProfile, setStoredProfile] = useState<Profile>({});

    useEffect(() => {
        if (profile.sub) {
            return;
        }

        let savedProfile = JSON.parse(localStorage.getItem('profile') ?? '{}') ?? {};
        if (!savedProfile.sub && dev) {
            savedProfile = DEV_MODE_PROFILE;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage after hydration.
        setStoredProfile(savedProfile);
        if (savedProfile.sub) {
            setProfile(savedProfile);
        }
    }, [dev, profile.sub, setProfile]);

    return profile.sub ? profile : storedProfile;
}
