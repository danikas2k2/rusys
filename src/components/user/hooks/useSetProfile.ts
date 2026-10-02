import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setProfileAction, type Profile } from '~/store/profile';

export function useSetProfile(): (profile: Profile) => void {
    const dispatch = useDispatch();
    return useCallback((profile: Profile) => dispatch(setProfileAction(profile)), [dispatch]);
}
