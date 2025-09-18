import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { clearGroupAction } from '~/state/group/actions';

export function useClearGroup(): () => void {
    const dispatch = useDispatch();
    return useCallback(() => void dispatch(clearGroupAction()), [dispatch]);
}
