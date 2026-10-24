import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { MoveProduct } from '~/schema';
import { moveProductAction } from '~/server/actions/products';

export function useMoveProduct(): (request: MoveProduct) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: MoveProduct): Promise<void> => {
            const { group, name, targetGroup } = request;
            if (group && name && targetGroup && group !== targetGroup) {
                await moveProductAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
