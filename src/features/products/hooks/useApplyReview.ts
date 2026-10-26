import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { ApplyReview } from '~/schema';
import { applyReviewAction } from '~/server/actions/products';

export function useApplyReview(): (request: ApplyReview) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: ApplyReview): Promise<void> => {
            const { updates } = request;
            if (updates.length) {
                trackFaroEvent('data_action', { entity: 'review', action: 'apply_review', result: 'started' });
                try {
                    await applyReviewAction(request);
                    trackFaroEvent('data_action', { entity: 'review', action: 'apply_review', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'review', action: 'apply_review', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
