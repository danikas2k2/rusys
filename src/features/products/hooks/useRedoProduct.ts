import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { redoProductAction } from '~/server/actions/products';

export function useRedoProduct(): (group: string, name: string, year: number) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, year: number): Promise<void> => {
            if (group && name) {
                await redoProductAction(group, name, year);
                await refresh();
            }
        },
        [refresh]
    );
}
