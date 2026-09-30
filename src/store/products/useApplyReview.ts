import { useCallback } from 'react';

import { applyReviewAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';

interface ReviewStatusUpdate {
    group: string;
    name: string;
    missing: boolean;
}

export function useApplyReview(): (updates: readonly ReviewStatusUpdate[]) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (updates: readonly ReviewStatusUpdate[]): Promise<void> => {
            if (updates.length) {
                await applyReviewAction(updates);
                await refresh();
            }
        },
        [refresh]
    );
}
