import { useCallback } from 'react';

import { addProductAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useAddProduct(): (group: string, name: string, parent?: string) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, parent?: string): Promise<void> => {
            if (group && name) {
                await addProductAction(group, name, parent);
                await refresh();
            }
        },
        [refresh]
    );
}
