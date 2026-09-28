import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { API } from '~/common/api/v1';
import type { ProductHistory } from '~/common/data';
import { useApiRequest } from '~/store/common/useApiRequest';
import { setSummaryHistoryAction } from '~/store/summary/actions';

export function useGetSummaryHistory(year: number, group?: string, name?: string): () => Promise<void> {
    const dispatch = useDispatch();
    const request = useApiRequest();
    return useCallback(async (): Promise<void> => {
        if (!group || !name) {
            return;
        }
        const history = await request<ProductHistory>(API.summaryHistory(group, name, year), 'GET');
        dispatch(setSummaryHistoryAction(group, name, year, history));
    }, [dispatch, group, name, request, year]);
}
