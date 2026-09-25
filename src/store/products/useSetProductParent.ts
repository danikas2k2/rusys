import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useSetProductParent(): (group: string, name: string, parent?: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, parent?: string): Promise<void> => {
            if (group && name) {
                await request(API.groupProduct(group, name), { parent: parent ?? null }, 'PATCH');
                await refresh();
            }
        },
        [refresh, request]
    );
}
