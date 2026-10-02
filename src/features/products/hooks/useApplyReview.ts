import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { applyReviewAction } from '~/server/actions/products';

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
