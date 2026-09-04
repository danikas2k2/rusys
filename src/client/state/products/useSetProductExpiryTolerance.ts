import { ApiUrl, type ApiSetExpiryTolerance } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

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
