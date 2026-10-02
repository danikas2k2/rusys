import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getProductHistory } from '~/server/actions/products';
import { setProductHistoryAction } from '~/store/products';

export function useGetProductHistory(year: number, group?: string, name?: string): () => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(async (): Promise<void> => {
        if (!group || !name) {
            return;
        }
        const history = await getProductHistory(group, name, year);
        dispatch(setProductHistoryAction({ group, name, year, history }));
    }, [dispatch, group, name, year]);
}
