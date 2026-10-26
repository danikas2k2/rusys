import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { AddProduct } from '~/schema';
import { addProductAction } from '~/server/actions/products';

export function useAddProduct(): (request: AddProduct) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: AddProduct): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                trackFaroEvent('data_action', { entity: 'product', action: 'create', result: 'started' });
                try {
                    await addProductAction(request);
                    trackFaroEvent('data_action', { entity: 'product', action: 'create', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'product', action: 'create', result: 'error' });
                    throw error;
                }
                trackFaroEvent('item_created');
                await refresh();
            }
        },
        [refresh]
    );
}
