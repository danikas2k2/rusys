import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getSummaryHistory } from '~/server/actions/summary';
import { setSummaryHistoryAction } from '~/store/summary/slice';

export function useGetSummaryHistory(year: number, group?: string, name?: string): () => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(async (): Promise<void> => {
        if (!group || !name) {
            return;
        }
        const history = await getSummaryHistory(group, name, year);
        dispatch(setSummaryHistoryAction({ group, name, year, history }));
    }, [dispatch, group, name, year]);
}
