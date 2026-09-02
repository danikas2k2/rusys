import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiSetMissingBulk } from '~/common/api';

export function useApplyReview(): (updates: ApiSetMissingBulk['updates']) => Promise<void> {
    const request = useUpdatingApiRequest<ApiSetMissingBulk>();
    return useCallback(
        async (updates: ApiSetMissingBulk['updates']): Promise<void> => {
            if (updates.length) {
                return request(ApiUrl.ProductsSetMissingBulk, { updates });
            }
        },
        [request]
    );
}
