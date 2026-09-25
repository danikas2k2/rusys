import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { API } from '~/common/api/v1';
import type { ProductHistory } from '~/common/data';
import { useApiRequest } from '~/store/common/useApiRequest';
import { setProductHistoryAction } from '~/store/products/actions';

export function useGetProductHistory(year: number, group?: string, name?: string): () => Promise<void> {
    const dispatch = useDispatch();
    const request = useApiRequest();
    return useCallback(async (): Promise<void> => {
        if (!group || !name) {
            return;
        }
        const history = await request<ProductHistory>(API.productHistory(group, name, year), 'GET');
        dispatch(setProductHistoryAction(group, name, year, history));
    }, [dispatch, group, name, request, year]);
}
