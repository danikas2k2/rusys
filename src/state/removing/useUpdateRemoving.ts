import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { updateRemovingAction } from '~/state/removing/actions';
import { type Group, type Name, type Year } from '~/state/types';

export function useUpdateRemoving(): (group: Group, name: Name, year: Year, removing: boolean) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    return useCallback(
        async (group: Group, name: Name, year: Year, removing: boolean): Promise<void> => {
            dispatch(updateRemovingAction(group, name, year, removing));
            return request('/setRemoving', { group, name, year, removing });
        },
        [request, dispatch]
    );
}
