import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useUndoProduct(): (group: string, name: string, year: number) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, year: number): Promise<void> => {
            if (group && name) {
                await request(`${API.productAmountHistory(group, name, year)}/undo`, undefined, 'POST');
                await refresh();
            }
        },
        [refresh, request]
    );
}
