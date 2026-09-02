import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiSetAmounts } from '~/common/api';
import type { VariantAmount } from '~/common/data';

export function useSetAmounts(): (
    group: string,
    name: string,
    year: number,
    amounts?: readonly VariantAmount[],
    user?: string,
    comment?: string
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiSetAmounts>();
    return useCallback(
        async (
            group: string,
            name: string,
            year: number,
            amounts?: readonly VariantAmount[],
            user?: string,
            comment?: string
        ): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsSetAmounts, { group, name, year, amounts, user, comment });
            }
        },
        [request]
    );
}
