import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useRenameProduct(): (group: string, name: string, newName: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, newName: string): Promise<void> => {
            if (group && name && newName && name !== newName) {
                await request(API.groupProduct(group, name), { name: newName }, 'PATCH');
                await refresh();
            }
        },
        [refresh, request]
    );
}
