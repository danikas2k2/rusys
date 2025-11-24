import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiMoveProduct } from '~/types/api';

export function useMoveProduct(): (group: string, name: string, newGroup: string, newName?: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiMoveProduct>();
    return useCallback(
        async (group: string, name: string, newGroup: string, newName?: string): Promise<void> => {
            if (group && name && newGroup && group !== newGroup) {
                return request(ApiUrl.ProductsMove, { group, name, newGroup, newName });
            }
        },
        [request]
    );
}
