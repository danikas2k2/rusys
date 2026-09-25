import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useSetProductExpiryTolerance(): (
    group: string,
    name: string,
    expiryToleranceDays: number
) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, expiryToleranceDays: number): Promise<void> => {
            if (group && name) {
                await request(API.groupProduct(group, name), { expiryToleranceDays }, 'PATCH');
                await refresh();
            }
        },
        [refresh, request]
    );
}
