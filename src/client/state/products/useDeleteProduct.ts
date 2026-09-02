import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiRequestProduct } from '~/common/api';

export function useDeleteProduct(): (group: string, name: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRequestProduct>();
    return useCallback(
        async (group: string, name: string): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsDelete, { group, name });
            }
        },
        [request]
    );
}
