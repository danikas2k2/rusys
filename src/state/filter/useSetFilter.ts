import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setFilterAction } from '~/state/filter/actions';

export function useSetFilter(): (filter: string) => void {
    const dispatch = useDispatch();
    return useCallback((filter: string) => void dispatch(setFilterAction(filter)), [dispatch]);
}
