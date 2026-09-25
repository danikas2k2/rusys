import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useMoveConsumedToRecycled(): (
    group: string,
    name: string,
    year: number,
    variant: string,
    amount: number,
    flags?: { suspicious?: boolean; home?: boolean; expiresAt?: number },
    user?: string
) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (
            group: string,
            name: string,
            year: number,
            variant: string,
            amount: number,
            flags: { suspicious?: boolean; home?: boolean } = {},
            user?: string
        ): Promise<void> => {
            if (group && name && variant && amount > 0) {
                await request(
                    API.productAmountHistory(group, name, year),
                    {
                        variant,
                        amount,
                        user,
                        ...flags,
                    },
                    'POST'
                );
                await refresh();
            }
        },
        [refresh, request]
    );
}
