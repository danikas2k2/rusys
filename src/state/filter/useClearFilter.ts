import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { clearFilterAction } from '~/state/filter/actions';

export function useClearFilter(): () => void {
    const dispatch = useDispatch();
    return useCallback(() => void dispatch(clearFilterAction()), [dispatch]);
}
