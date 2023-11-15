import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { updateDetailsAction } from '~/state/details/actions';
import { type Amount } from '~/state/details/types';
import { type Group, type Name, type Year } from '~/state/types';

export function useUpdateDetails(): (
    group: Group,
    name: Name,
    year?: Year,
    value?: Amount,
    updateWithoutHistory?: boolean
) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    return useCallback(
        async (group: Group, name: Name, year?: Year, value?: Amount, updateWithoutHistory = false): Promise<void> => {
            dispatch(updateDetailsAction(group, name, year, value));
            return request('/updateDetails', { group, name, year, value, updateWithoutHistory });
        },
        [request, dispatch]
    );
}
