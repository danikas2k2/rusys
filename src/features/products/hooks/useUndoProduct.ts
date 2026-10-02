import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { undoProductAction } from '~/server/actions/products';

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
