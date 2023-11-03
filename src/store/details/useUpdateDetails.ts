import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useApiRequest from '~/store/base/useApiRequest';
import { updateDetailsAction } from '~/store/details/actions';
import { type Amount } from '~/store/details/types';
import { type Name, type Year } from '~/store/types';

export default function useUpdateDetails(): (
    name: Name,
    year?: Year,
    value?: Amount,
    updateWithoutHistory?: boolean
) => Promise<void> {
    const dispatch = useDispatch();
    const request = useApiRequest();
    return useCallback(
        async (name: Name, year?: Year, value?: Amount, updateWithoutHistory = false): Promise<void> => {
            dispatch(updateDetailsAction(name, year, value));
            return request('updateDetails', { name, year, value, updateWithoutHistory });
        },
        [request, dispatch]
    );
}
