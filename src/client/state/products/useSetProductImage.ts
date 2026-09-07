import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

export function useSetProductImage(): (group: string, name: string, image: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, image: string): Promise<void> => {
            if (group && name) {
                await request(API.productImage(group, name), { image }, 'PUT');
                await refresh();
            }
        },
        [refresh, request]
    );
}
