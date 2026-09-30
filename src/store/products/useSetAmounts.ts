import { useCallback } from 'react';

import type { VariantAmount } from '~/common/data';
import { setAmountsAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useSetAmounts(): (
    group: string,
    name: string,
    year: number,
    amounts?: readonly VariantAmount[],
    user?: string,
    comment?: string
) => Promise<void> {
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
                await setAmountsAction(group, name, year, amounts, user, comment);
                await refresh();
            }
        },
        [refresh]
    );
}
