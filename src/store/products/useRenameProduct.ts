import { useCallback } from 'react';

import { renameProductAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useRenameProduct(): (group: string, name: string, newName: string) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, newName: string): Promise<void> => {
            if (group && name && newName && name !== newName) {
                await renameProductAction(group, name, newName);
                await refresh();
            }
        },
        [refresh]
    );
}
