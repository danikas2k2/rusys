import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getGroupsAction } from '~/server/actions/groups';
import { setGroupsAction } from '~/store/groups/actions';

export function useGetGroups(): (initial?: boolean) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(async (): Promise<void> => {
        dispatch(setGroupsAction([...(await getGroupsAction())]));
    }, [dispatch]);
}
