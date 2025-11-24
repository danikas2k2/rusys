import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiRenameProduct } from '~/types/api';

export function useRenameProduct(): (group: string, name: string, newName: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRenameProduct>();
    return useCallback(
        async (group: string, name: string, newName: string): Promise<void> => {
            if (group && name && newName && name !== newName) {
                return request(ApiUrl.ProductsRename, { group, name, newName });
            }
        },
        [request]
    );
}
