import { useSelector } from 'react-redux';
import { useDev } from '~/common/hooks/useDev';
import { type Profile, type WithProfileState } from '~/state/profile/types';
import { useSetProfile } from '~/state/profile/useSetProfile';
import { isEqual } from 'lodash';

export const DEV_MODE_SUB = 'DEV_MODE';
export const DEV_MODE_PROFILE: Profile = {
    dev: true,
    sub: DEV_MODE_SUB,
    name: 'Dev Mode',
};

export function useProfile(): Profile {
    const setProfile = useSetProfile();
    const isDev = useDev();
    let profile = useSelector((state: WithProfileState) => state.profile ?? {}, isEqual);
    if (!profile.sub) {
        profile = JSON.parse(localStorage.getItem('profile') ?? '{}') ?? {};
        if (!profile.sub && isDev) {
            profile = DEV_MODE_PROFILE;
        }
        if (profile.sub) {
            setProfile(profile);
        }
    }
    return profile;
}
