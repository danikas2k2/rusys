import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { invalidateProductHistories } from '~/features/products/hooks/historyCache';
import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { TransferAmounts } from '~/schema';
import { transferAmountsAction } from '~/server/actions/products';

export function useTransferAmounts(): (request: TransferAmounts) => Promise<void> {
    const refresh = useGetProducts();
    const client = useQueryClient();
    return useCallback(
        async (request: TransferAmounts): Promise<void> => {
            trackFaroEvent('data_action', { entity: 'stock', action: 'transfer_amounts', result: 'started' });
            try {
                await transferAmountsAction(request);
                invalidateProductHistories(client, request);
                invalidateProductHistories(client, { group: request.targetGroup, name: request.targetName });
                trackFaroEvent('data_action', { entity: 'stock', action: 'transfer_amounts', result: 'success' });
            } catch (error) {
                trackFaroEvent('data_action', { entity: 'stock', action: 'transfer_amounts', result: 'error' });
                throw error;
            }
            await refresh();
        },
        [refresh, client]
    );
}
