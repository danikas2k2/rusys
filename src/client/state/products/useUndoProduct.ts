import { ApiV1 } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

export function useUndoProduct(): (group: string, name: string, year: number) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, year: number): Promise<void> => {
            if (group && name) {
                await request(`${ApiV1.productAmountHistory(group, name, year)}/undo`, undefined, 'POST');
                await refresh();
            }
        },
        [refresh, request]
    );
}
