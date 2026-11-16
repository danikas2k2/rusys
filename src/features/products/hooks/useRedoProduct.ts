import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { invalidateProductHistories } from '~/features/products/hooks/historyCache';
import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { ProductYearIdentity } from '~/schema';
import { redoProductAction } from '~/server/actions/products';

export function useRedoProduct(): (request: ProductYearIdentity) => Promise<void> {
    const refresh = useGetProducts();
    const client = useQueryClient();
    return useCallback(
        async (request: ProductYearIdentity): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                trackFaroEvent('data_action', { entity: 'product', action: 'redo', result: 'started' });
                try {
                    await redoProductAction(request);
                    invalidateProductHistories(client, request);
                    trackFaroEvent('data_action', { entity: 'product', action: 'redo', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'product', action: 'redo', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh, client]
    );
}
