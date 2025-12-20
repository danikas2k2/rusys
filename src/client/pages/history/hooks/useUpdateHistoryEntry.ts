import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiResult } from '~/types/api';
import type { VariantAmount } from '~/types/data';

function assertOk<R extends object>(result: ApiResult<R>): asserts result is { ok: true } & R {
    if (!result.ok) {
        throw new Error(result.error || 'Request failed');
    }
}

export function useUpdateHistoryEntry(): (args: {
    group: string;
    name: string;
    time: number;
    year: number;
    amounts: readonly VariantAmount[];
    user?: string;
}) => Promise<void> {
    const request = useUpdatingApiRequest<object>();

    return useCallback(
        async ({ group, name, time, year, amounts, user }): Promise<void> => {
            const result = await request<ApiResult>(ApiUrl.ProductsHistoryUpdate, {
                group,
                name,
                time,
                year,
                amounts,
                user,
            });
            assertOk(result as ApiResult<object>);
        },
        [request]
    );
}


