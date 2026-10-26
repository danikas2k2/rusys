import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { MoveProduct } from '~/schema';
import { moveProductAction } from '~/server/actions/products';

export function useMoveProduct(): (request: MoveProduct) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: MoveProduct): Promise<void> => {
            const { group, name, targetGroup } = request;
            if (group && name && targetGroup && group !== targetGroup) {
                trackFaroEvent('data_action', { entity: 'product', action: 'move', result: 'started' });
                try {
                    await moveProductAction(request);
                    trackFaroEvent('data_action', { entity: 'product', action: 'move', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'product', action: 'move', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
