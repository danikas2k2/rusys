import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiMoveProductsHistoryEntry, type ApiResult } from '~/types/api';

function assertOk<R extends object>(result: ApiResult<R>): asserts result is { ok: true } & R {
    if (!result.ok) {
        throw new Error(result.error || 'Request failed');
    }
}

export function useMoveHistoryEntry(): (args: ApiMoveProductsHistoryEntry) => Promise<void> {
    const request = useUpdatingApiRequest<ApiMoveProductsHistoryEntry>();

    return useCallback(
        async (args: ApiMoveProductsHistoryEntry): Promise<void> => {
            const result = await request<ApiResult>(ApiUrl.HistoryMove, args);
            assertOk(result as ApiResult<object>);
        },
        [request]
    );
}
