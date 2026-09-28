import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useDeleteProduct(): (group: string, name: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string): Promise<void> => {
            if (group && name) {
                await request(API.groupProduct(group, name), undefined, 'DELETE');
                await refresh();
            }
        },
        [refresh, request]
    );
}
