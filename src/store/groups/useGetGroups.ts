import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { readGroups } from '~/server/actions/readData';
import { setGroupsAction } from '~/store/groups/actions';

export function useGetGroups(): (initial?: boolean) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(async (): Promise<void> => {
        dispatch(setGroupsAction([...(await readGroups())]));
    }, [dispatch]);
}
