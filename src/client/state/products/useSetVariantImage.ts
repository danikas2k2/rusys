import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

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
