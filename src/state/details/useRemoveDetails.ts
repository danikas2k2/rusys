import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { removeDetailsAction } from '~/state/details/actions';
import { type Group, type Name } from '~/state/types';

export function useRemoveDetails(): (group: Group, name: Name) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    return useCallback(
        async (group: Group, name: Name): Promise<void> => {
            dispatch(removeDetailsAction(group, name));
            if (name) {
                return request('/remove', { group, name });
            }
        },
        [request, dispatch]
    );
}
