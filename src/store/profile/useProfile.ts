import { isDevMode } from '~/common/utils/dev';
import { useIdentity } from '~/components/app/IdentityContext';
import { DEV_MODE_PROFILE } from './dev';
import type { Profile } from './types';

export function useProfile(): Profile {
    const { profile } = useIdentity();
    return profile.sub ? profile : isDevMode() ? { ...DEV_MODE_PROFILE, allowed: true } : profile;
}
