import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setProfileAction } from '~/client/state/profile/actions';
import { type Profile } from '~/client/state/profile/types';

export function useSetProfile(): (profile: Profile) => void {
    const dispatch = useDispatch();
    return useCallback((profile: Profile) => dispatch(setProfileAction(profile)), [dispatch]);
}
