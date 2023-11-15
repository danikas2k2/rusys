import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { renameGroupAction } from '~/state/details/actions';
import { type Group } from '~/state/types';

export function useRenameGroup(): (group: Group, newGroup: Group) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    return useCallback(
        async (group: Group, newGroup: Group): Promise<void> => {
            if (newGroup && group !== newGroup) {
                dispatch(renameGroupAction(group, newGroup));
                return request('/renameGroup', { group, newGroup });
            }
        },
        [request, dispatch]
    );
}
