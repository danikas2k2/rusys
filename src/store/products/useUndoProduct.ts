import { useCallback } from 'react';

import { undoProductAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useUndoProduct(): (group: string, name: string, year: number) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, year: number): Promise<void> => {
            if (group && name) {
                await undoProductAction(group, name, year);
                await refresh();
            }
        },
        [refresh]
    );
}
