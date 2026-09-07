import type { ApiSetMissingBulk } from '@rusys/common/api';
import { ApiV1 } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

export function useApplyReview(): (updates: ApiSetMissingBulk['updates']) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (updates: ApiSetMissingBulk['updates']): Promise<void> => {
            if (updates.length) {
                const byGroup = Map.groupBy(updates, (update) => update.group);
                await Promise.all(
                    [...byGroup].map(([group, groupUpdates]) =>
                        request(
                            ApiV1.productReviewStatuses(group),
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
