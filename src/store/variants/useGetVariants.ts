import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { readVariants } from '~/server/actions/readData';
import { setGroupsAction } from '~/store/groups/actions';
import { setVariantsAction } from '~/store/variants/actions';

export function useGetVariants(): (initial?: boolean) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(async (): Promise<void> => {
        const data = await readVariants();
        dispatch(setVariantsAction([...data.variants]));
        dispatch(setGroupsAction([...data.groups]));
    }, [dispatch]);
}
