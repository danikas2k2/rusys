import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { AddProduct } from '~/schema';
import { addProductAction } from '~/server/actions/products';

export function useAddProduct(): (request: AddProduct) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: AddProduct): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                await addProductAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
