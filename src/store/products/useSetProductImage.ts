import { useCallback } from 'react';

import { setProductImageAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useSetProductImage(): (group: string, name: string, image: string) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, image: string): Promise<void> => {
            if (group && name) {
                await setProductImageAction(group, name, image);
                await refresh();
            }
        },
        [refresh]
    );
}
