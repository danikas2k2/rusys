import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setGroupAction } from '~/state/group/actions';

export function useSetGroup(): (group: string) => void {
    const dispatch = useDispatch();
    return useCallback((group: string) => void dispatch(setGroupAction(group)), [dispatch]);
}
