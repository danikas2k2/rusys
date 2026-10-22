import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { DeleteProduct } from '~/schema';
import { deleteProductAction } from '~/server/actions/products';

export function useDeleteProduct(): (request: DeleteProduct) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: DeleteProduct): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                await deleteProductAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
