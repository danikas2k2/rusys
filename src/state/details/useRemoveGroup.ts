import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { removeGroupAction } from '~/state/details/actions';
import { type Group } from '~/state/types';

export function useRemoveGroup(): (group: Group) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    return useCallback(
        async (group: Group): Promise<void> => {
            dispatch(removeGroupAction(group));
            return request('/removeGroup', { group });
        },
        [request, dispatch]
    );
}
