import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateDetailsAction } from '~/store/details/actions';
import { type Amount } from '~/store/details/types';
import { type Name, type Year } from '~/store/types';
import useApiRequest from '~/store/base/useApiRequest';

export default function useUpdateDetails(): (name: Name, year?: Year, value?: Amount) => Promise<void> {
    const dispatch = useDispatch();
    const request = useApiRequest();
    return useCallback(
        async (name: Name, year?: Year, value?: Amount): Promise<void> => {
            dispatch(updateDetailsAction(name, year, value));
            return request('updateDetails', { name, year, value });
        },
        [request, dispatch]
    );
}
