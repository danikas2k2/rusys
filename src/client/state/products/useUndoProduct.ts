import { ApiUrl, type ApiRequestProduct } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useUndoProduct(): (group: string, name: string, year: number) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRequestProduct>();
    return useCallback(
        async (group: string, name: string, year: number): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsUndo, { group, name, year });
            }
        },
        [request]
    );
}
