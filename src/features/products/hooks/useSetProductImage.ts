import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { setProductImageAction } from '~/server/actions/products';

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
