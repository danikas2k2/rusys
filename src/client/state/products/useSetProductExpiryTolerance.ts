import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiSetExpiryTolerance } from '~/types/api';

export function useSetProductExpiryTolerance(): (
    group: string,
    name: string,
    expiryToleranceDays: number
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiSetExpiryTolerance>();
    return useCallback(
        async (group: string, name: string, expiryToleranceDays: number): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsSetExpiryTolerance, { group, name, expiryToleranceDays });
            }
        },
        [request]
    );
}
