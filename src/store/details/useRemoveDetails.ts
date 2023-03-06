import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { removeDetailsAction } from '~/store/details/actions';
import type { Name } from '~/store/details/types';
import useDetailsRequest from '~/store/details/useDetailsRequest';

export default function useRemoveDetails(): (name: Name) => Promise<void> {
    const dispatch = useDispatch();
    const detailsRequest = useDetailsRequest();
    return useCallback(
        async (name: Name): Promise<void> => {
            dispatch(removeDetailsAction(name));
            if (name) {
                return detailsRequest('remove', { name });
            }
        },
        [detailsRequest, dispatch]
    );
}
