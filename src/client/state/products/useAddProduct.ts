import { ApiUrl, type ApiAddProduct } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useAddProduct(): (group: string, name: string, parent?: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiAddProduct>();
    return useCallback(
        async (group: string, name: string, parent?: string): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsAdd, { group, name, parent });
            }
        },
        [request]
    );
}
