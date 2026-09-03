import { ApiUrl, type ApiRequestProduct } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

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
