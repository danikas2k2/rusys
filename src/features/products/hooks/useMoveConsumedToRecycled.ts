import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { MoveConsumedToRecycled } from '~/schema';
import { moveConsumedToRecycledAction } from '~/server/actions/products';

export function useMoveConsumedToRecycled(): (request: MoveConsumedToRecycled) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: MoveConsumedToRecycled): Promise<void> => {
            const { group, name, variant, amount } = request;
            if (group && name && variant && amount > 0) {
                await moveConsumedToRecycledAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
