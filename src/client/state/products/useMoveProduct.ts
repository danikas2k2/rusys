import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

export function useMoveProduct(): (group: string, name: string, newGroup: string, newName?: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, newGroup: string, newName?: string): Promise<void> => {
            if (group && name && newGroup && group !== newGroup) {
                await request(API.groupProduct(group, name), { group: newGroup, newName }, 'PATCH');
                await refresh();
            }
        },
        [refresh, request]
    );
}
