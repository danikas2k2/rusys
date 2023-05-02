import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { renameDetailsAction } from '~/store/details/actions';
import { type Name } from '~/store/details/types';
import useDetailsRequest from '~/store/details/useDetailsRequest';

export default function useRenameDetails(): (name: Name, newName: Name) => Promise<void> {
    const dispatch = useDispatch();
    const detailsRequest = useDetailsRequest();
    return useCallback(
        async (name: Name, newName: Name): Promise<void> => {
            if (name !== newName) {
                dispatch(renameDetailsAction(name, newName));
                return detailsRequest('setName', { name, newName });
            }
        },
        [detailsRequest, dispatch]
    );
}
