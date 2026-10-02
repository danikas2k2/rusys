import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { renameProductAction } from '~/server/actions/products';

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
