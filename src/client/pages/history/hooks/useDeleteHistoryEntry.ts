import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiResult } from '~/types/api';
import type { ProductUpdateHistoryItem } from '~/types/data';

function assertOk<R extends object>(result: ApiResult<R>): asserts result is { ok: true } & R {
    if (!result.ok) {
        throw new Error(result.error || 'Request failed');
    }
}

export function useDeleteHistoryEntry(): (item: ProductUpdateHistoryItem) => Promise<void> {
    const request = useUpdatingApiRequest<object>();

    return useCallback(
        async (item: ProductUpdateHistoryItem): Promise<void> => {
            const result = await request<ApiResult>(ApiUrl.ProductsHistoryDelete, {
                group: item.group,
                name: item.name,
                time: item.time,
                year: item.year,
            });
            assertOk(result as ApiResult<object>);
        },
        [request]
    );
}


