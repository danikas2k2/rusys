import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { DeleteProduct } from '~/schema';
import { deleteProductAction } from '~/server/actions/products';

export function useDeleteProduct(): (request: DeleteProduct) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: DeleteProduct): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                trackFaroEvent('data_action', { entity: 'product', action: 'delete', result: 'started' });
                try {
                    await deleteProductAction(request);
                    trackFaroEvent('data_action', { entity: 'product', action: 'delete', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'product', action: 'delete', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
