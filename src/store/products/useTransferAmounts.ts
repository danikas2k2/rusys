import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import type { VariantAmount } from '~/common/data';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
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
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group, name, year, targetGroup, targetName, amounts, user, comment): Promise<void> => {
            await request(
                API.productAmountTransfers(group, name, year),
                { targetGroup, targetName, amounts, user, comment },
                'POST'
            );
            await refresh();
        },
        [refresh, request]
    );
}
