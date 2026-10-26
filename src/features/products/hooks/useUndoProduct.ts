import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { ProductYearIdentity } from '~/schema';
import { undoProductAction } from '~/server/actions/products';

export function useUndoProduct(): (request: ProductYearIdentity) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: ProductYearIdentity): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                trackFaroEvent('data_action', { entity: 'product', action: 'undo', result: 'started' });
                try {
                    await undoProductAction(request);
                    trackFaroEvent('data_action', { entity: 'product', action: 'undo', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'product', action: 'undo', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
