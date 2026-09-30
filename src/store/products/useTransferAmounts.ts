import { useCallback } from 'react';

import type { VariantAmount } from '~/common/data';
import { transferAmountsAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useTransferAmounts(): (
    group: string,
    name: string,
    year: number,
    targetGroup: string,
    targetName: string,
    amounts: readonly VariantAmount[],
    user?: string,
    comment?: string
) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group, name, year, targetGroup, targetName, amounts, user, comment): Promise<void> => {
            await transferAmountsAction(group, name, year, targetGroup, targetName, amounts, user, comment);
            await refresh();
        },
        [refresh]
    );
}
