import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateDetailsAction } from '~/store/details/actions';
import { type Name, type Value, type Year } from '~/store/details/types';
import useDetailsRequest from '~/store/details/useDetailsRequest';

export default function useUpdateDetails(): (name: Name, year?: Year, value?: Value) => Promise<void> {
    const dispatch = useDispatch();
    const detailsRequest = useDetailsRequest();
    return useCallback(
        async (name: Name, year?: Year, value?: Value): Promise<void> => {
            dispatch(updateDetailsAction(name, year, value));
            return detailsRequest('updateDetails', { name, year, value });
        },
        [detailsRequest, dispatch]
    );
}
