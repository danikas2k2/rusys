import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { renameDetailsAction } from '~/state/details/actions';
import { type Group, type Name } from '~/state/types';

export function useRenameDetails(): (group: Group, name: Name, newName: Name) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    return useCallback(
        async (group: Group, name: Name, newName: Name): Promise<void> => {
            if (newName && name !== newName) {
                dispatch(renameDetailsAction(group, name, newName));
                return request('/rename', { group, name, newName });
            }
        },
        [request, dispatch]
    );
}
