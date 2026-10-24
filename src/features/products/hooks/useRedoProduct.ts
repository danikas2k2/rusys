import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { ProductYearIdentity } from '~/schema';
import { redoProductAction } from '~/server/actions/products';

export function useRedoProduct(): (request: ProductYearIdentity) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: ProductYearIdentity): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                await redoProductAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
