import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { readSummary } from '~/server/actions/readData';
import { setGroupsAction } from '~/store/groups/actions';
import { setSummaryAction } from '~/store/summary/actions';
import { setVariantsAction } from '~/store/variants/actions';
import { setYearsAction } from '~/store/years/actions';

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
