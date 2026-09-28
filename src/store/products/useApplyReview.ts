import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

interface ReviewStatusUpdate {
    group: string;
    name: string;
    missing: boolean;
}

export function useApplyReview(): (updates: readonly ReviewStatusUpdate[]) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (updates: readonly ReviewStatusUpdate[]): Promise<void> => {
            if (updates.length) {
                await request(API.productReviewStatuses(), { updates }, 'PATCH');
                await refresh();
            }
        },
        [refresh, request]
    );
}
