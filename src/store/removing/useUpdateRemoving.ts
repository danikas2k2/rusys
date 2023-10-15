import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateRemovingAction } from '~/store/removing/actions';
import { type Name, type Year } from '~/store/types';
import useApiRequest from '~/store/base/useApiRequest';

export default function useUpdateRemoving(): (name: Name, year: Year, removing: boolean) => Promise<void> {
    const dispatch = useDispatch();
    const request = useApiRequest();
    return useCallback(
        async (name: Name, year: Year, removing: boolean): Promise<void> => {
            dispatch(updateRemovingAction(name, year, removing));
            return request('setRemoving', { name, year, removing });
        },
        [request, dispatch]
    );
}
