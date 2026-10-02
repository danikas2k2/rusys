import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { moveConsumedToRecycledAction } from '~/server/actions/products';

export function useMoveConsumedToRecycled(): (
    group: string,
    name: string,
    year: number,
    variant: string,
    amount: number,
    flags?: { suspicious?: boolean; home?: boolean; expiresAt?: number },
    user?: string
) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (
            group: string,
            name: string,
            year: number,
            variant: string,
            amount: number,
            flags: { suspicious?: boolean; home?: boolean; expiresAt?: number } = {},
            user?: string
        ): Promise<void> => {
            if (group && name && variant && amount > 0) {
                await moveConsumedToRecycledAction(group, name, year, variant, amount, flags, user);
                await refresh();
            }
        },
        [refresh]
    );
}
