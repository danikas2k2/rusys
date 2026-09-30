import { useCallback } from 'react';

import { deleteProductAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useDeleteProduct(): (group: string, name: string) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string): Promise<void> => {
            if (group && name) {
                await deleteProductAction(group, name);
                await refresh();
            }
        },
        [refresh]
    );
}
