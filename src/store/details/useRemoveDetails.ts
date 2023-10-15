import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { removeDetailsAction } from '~/store/details/actions';
import { type Name } from '~/store/types';
import useApiRequest from '~/store/base/useApiRequest';

export default function useRemoveDetails(): (name: Name) => Promise<void> {
    const dispatch = useDispatch();
    const request = useApiRequest();
    return useCallback(
        async (name: Name): Promise<void> => {
            dispatch(removeDetailsAction(name));
            if (name) {
                return request('remove', { name });
            }
        },
        [request, dispatch]
    );
}
