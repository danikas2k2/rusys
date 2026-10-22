import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { ApplyReview } from '~/schema';
import { applyReviewAction } from '~/server/actions/products';

export function useApplyReview(): (request: ApplyReview) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: ApplyReview): Promise<void> => {
            const { updates } = request;
            if (updates.length) {
                await applyReviewAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
