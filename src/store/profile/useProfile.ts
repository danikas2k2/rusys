import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import { isDevMode } from '~/common/utils/dev';
import { DEV_MODE_PROFILE } from './dev';
import type { Profile, WithProfileState } from './types';

export function useProfile(): Profile {
    const profile = useSelector((state: WithProfileState) => state.profile ?? {}, equal);
    return profile.sub ? profile : isDevMode() ? { ...DEV_MODE_PROFILE, allowed: true } : profile;
}
