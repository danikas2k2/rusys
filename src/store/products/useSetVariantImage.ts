import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useSetVariantImage(): (group: string, name: string, variant: string, image: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, variant: string, image: string): Promise<void> => {
            if (group && name && variant) {
                await request(API.productVariantImage(group, name, variant), { image }, 'PUT');
                await refresh();
            }
        },
        [refresh, request]
    );
}
