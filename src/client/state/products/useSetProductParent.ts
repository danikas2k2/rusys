import { ApiV1 } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

export function useSetProductParent(): (group: string, name: string, parent?: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, parent?: string): Promise<void> => {
            if (group && name) {
                await request(ApiV1.groupProduct(group, name), { parent: parent ?? null }, 'PATCH');
                await refresh();
            }
        },
        [refresh, request]
    );
}
