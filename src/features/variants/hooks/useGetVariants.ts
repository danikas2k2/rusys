import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getVariantsAction } from '~/server/actions/variants';
import { setGroupsAction } from '~/store/groups/slice';
import { setVariantsAction } from '~/store/variants/slice';

export function useGetVariants(): (initial?: boolean) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(async (): Promise<void> => {
        const data = await getVariantsAction();
        dispatch(setVariantsAction([...data.variants]));
        dispatch(setGroupsAction([...data.groups]));
    }, [dispatch]);
}
