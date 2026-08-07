import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiMoveConsumedToRecycled } from '~/types/api';

export function useMoveConsumedToRecycled(): (
    group: string,
    name: string,
    year: number,
    variant: string,
    amount: number,
    flags?: { suspicious?: boolean; home?: boolean; expiresAt?: number },
    user?: string
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiMoveConsumedToRecycled>();
    return useCallback(
        async (
            group: string,
            name: string,
            year: number,
            variant: string,
            amount: number,
            flags: { suspicious?: boolean; home?: boolean } = {},
            user?: string
        ): Promise<void> => {
            if (group && name && variant && amount > 0) {
                return request(ApiUrl.ProductsMoveToRecycled, {
                    group,
                    name,
                    year,
                    variant,
                    amount,
                    user,
                    ...flags,
                });
            }
        },
        [request]
    );
}
