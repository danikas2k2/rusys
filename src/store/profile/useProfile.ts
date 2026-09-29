import equal from 'fast-deep-equal/es6/react';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';

import { isDevMode } from '~/common/utils/dev';
import { DEV_MODE_PROFILE } from '~/store/profile/dev';
import type { Profile, WithProfileState } from '~/store/profile/types';
import { useSetProfile } from '~/store/profile/useSetProfile';

export function useProfile(): Profile {
    const setProfile = useSetProfile();
    const dev = isDevMode();
    const profile = useSelector((state: WithProfileState) => state.profile ?? {}, equal);
    const storedProfileJson = useSyncExternalStore(
        (onChange) => {
            window.addEventListener('storage', onChange);
            return () => window.removeEventListener('storage', onChange);
        },
        () => localStorage.getItem('profile') ?? '{}',
        () => '{}'
    );
    const storedProfile = useMemo<Profile>(() => {
        let savedProfile: Profile;
        try {
            savedProfile = JSON.parse(storedProfileJson) ?? {};
        } catch {
            savedProfile = {};
        }
        return !savedProfile.sub && dev ? DEV_MODE_PROFILE : savedProfile;
    }, [dev, storedProfileJson]);

    useEffect(() => {
        if (!profile.sub && storedProfile.sub) {
            setProfile(storedProfile);
        }
    }, [profile.sub, setProfile, storedProfile]);

    return profile.sub ? profile : storedProfile;
}
