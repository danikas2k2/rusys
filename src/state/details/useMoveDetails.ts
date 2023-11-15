import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { moveDetailsAction } from '~/state/details/actions';
import { type Group, type Name } from '~/state/types';

export function useMoveDetails(): (group: Group, name: Name, newGroup: Group) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    return useCallback(
        async (group: Group, name: Name, newGroup: Group): Promise<void> => {
            if (name && group !== newGroup) {
                dispatch(moveDetailsAction(group, name, newGroup));
                return request('/move', { group, name, newGroup });
            }
        },
        [request, dispatch]
    );
}
