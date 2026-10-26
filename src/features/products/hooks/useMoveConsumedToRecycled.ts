import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { MoveConsumedToRecycled } from '~/schema';
import { moveConsumedToRecycledAction } from '~/server/actions/products';

export function useMoveConsumedToRecycled(): (request: MoveConsumedToRecycled) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: MoveConsumedToRecycled): Promise<void> => {
            const { group, name, variant, amount } = request;
            if (group && name && variant && amount > 0) {
                trackFaroEvent('data_action', { entity: 'stock', action: 'recycle', result: 'started' });
                try {
                    await moveConsumedToRecycledAction(request);
                    trackFaroEvent('data_action', { entity: 'stock', action: 'recycle', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'stock', action: 'recycle', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
