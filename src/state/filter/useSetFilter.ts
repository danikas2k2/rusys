import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setFilterAction } from '~/state/filter/actions';
import { type Filter } from '~/state/filter/types';

export function useSetFilter(): (filter: Filter) => void {
    const dispatch = useDispatch();
    return useCallback((filter: Filter) => void dispatch(setFilterAction(filter)), [dispatch]);
}
