import { API } from '@rusys/common/api/v1';
import type { VariantAmount } from '@rusys/common/data';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

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
