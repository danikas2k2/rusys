import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

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
                const byGroup = Map.groupBy(updates, (update) => update.group);
                await Promise.all(
                    [...byGroup].map(([group, groupUpdates]) =>
                        request(
                            API.productReviewStatuses(group),
                            { updates: groupUpdates.map(({ name, missing }) => ({ name, missing })) },
                            'PATCH'
                        )
                    )
                );
                await refresh();
            }
        },
        [refresh, request]
    );
}
