import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { readSummary } from '~/server/actions/summary';
import { setGroupsAction } from '~/store/groups/slice';
import { setSummaryAction } from '~/store/summary/slice';
import { setVariantsAction } from '~/store/variants/slice';
import { setYearsAction } from '~/store/years/slice';

export function useGetSummary(): (initial?: boolean) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(async (): Promise<void> => {
        const { years, groups, variants, summary } = await readSummary();
        dispatch(setYearsAction([...years]));
        dispatch(setGroupsAction([...groups]));
        dispatch(setVariantsAction([...variants]));
        dispatch(setSummaryAction([...summary]));
    }, [dispatch]);
}
