import { ApiUrl, type ApiSetAmounts } from '@rusys/common/api';
import type { VariantAmount } from '@rusys/common/data';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

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
