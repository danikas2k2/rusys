import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiRequestProduct } from '~/types/api';

export function useAddProduct(): (group: string, name: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRequestProduct>();
    return useCallback(
        async (group: string, name: string): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsAdd, { group, name });
            }
        },
        [request]
    );
}
