import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiRequestProduct } from '~/common/api';

export function useRedoProduct(): (group: string, name: string, year: number) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRequestProduct>();
    return useCallback(
        async (group: string, name: string, year: number): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsRedo, { group, name, year });
            }
        },
        [request]
    );
}
