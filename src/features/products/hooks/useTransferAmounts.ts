import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { TransferAmounts } from '~/schema';
import { transferAmountsAction } from '~/server/actions/products';

export function useTransferAmounts(): (request: TransferAmounts) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: TransferAmounts): Promise<void> => {
            await transferAmountsAction(request);
            await refresh();
        },
        [refresh]
    );
}
