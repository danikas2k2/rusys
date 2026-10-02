import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setProfileAction } from '~/store/profile/slice';
import type { Profile } from '~/store/profile/types';

export function useSetProfile(): (profile: Profile) => void {
    const dispatch = useDispatch();
    return useCallback((profile: Profile) => dispatch(setProfileAction(profile)), [dispatch]);
}
