import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { moveProductAction } from '~/server/actions/products';

export function useMoveProduct(): (group: string, name: string, newGroup: string, newName?: string) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, newGroup: string, newName?: string): Promise<void> => {
            if (group && name && newGroup && group !== newGroup) {
                await moveProductAction(group, name, newGroup, newName);
                await refresh();
            }
        },
        [refresh]
    );
}
