import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { renameDetailsAction } from '~/store/details/actions';
import { type Name } from '~/store/types';
import useApiRequest from '~/store/base/useApiRequest';

export default function useRenameDetails(): (name: Name, newName: Name) => Promise<void> {
    const dispatch = useDispatch();
    const request = useApiRequest();
    return useCallback(
        async (name: Name, newName: Name): Promise<void> => {
            if (name !== newName) {
                dispatch(renameDetailsAction(name, newName));
                return request('setName', { name, newName });
            }
        },
        [request, dispatch]
    );
}
