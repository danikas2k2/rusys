import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import type { VariantAmount } from '~/common/data';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useSetAmounts(): (
    group: string,
    name: string,
    year: number,
    amounts?: readonly VariantAmount[],
    user?: string,
    comment?: string
) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
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
                await request(API.productAmounts(group, name, year), { amounts, user, comment }, 'PUT');
                await refresh();
            }
        },
        [refresh, request]
    );
}
