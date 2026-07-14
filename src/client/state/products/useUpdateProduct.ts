import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiUpdateProduct } from '~/types/api';
import type { VariantAmount } from '~/types/data';

export function useUpdateProduct(): (
    group: string,
    name: string,
    year: number,
    amounts?: readonly VariantAmount[],
    user?: string,
    comment?: string
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateProduct>();
    return useCallback(
        async (
            group: string,
            name: string,
            year: number,
            amounts?: readonly VariantAmount[],
            user?: string,
            comment?: string
        ): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsUpdate, { group, name, year, amounts, user, comment });
            }
        },
        [request]
    );
}
