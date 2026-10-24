import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { ProductYearIdentity } from '~/schema';
import { undoProductAction } from '~/server/actions/products';

export function useUndoProduct(): (request: ProductYearIdentity) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: ProductYearIdentity): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                await undoProductAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
