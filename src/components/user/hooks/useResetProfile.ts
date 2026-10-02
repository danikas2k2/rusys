import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { resetProfileAction } from '~/store/profile/slice';

export function useResetProfile(): () => void {
    const dispatch = useDispatch();
    return useCallback(() => dispatch(resetProfileAction()), [dispatch]);
}
