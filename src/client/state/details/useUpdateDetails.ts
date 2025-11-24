import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiUpdateDetails } from '~/types/api';
import type { VariantAmount } from '~/types/data';

export function useUpdateDetails(): (
    group: string,
    name: string,
    year: number,
    amounts?: readonly VariantAmount[],
    user?: string
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateDetails>();
    return useCallback(
        async (
            group: string,
            name: string,
            year: number,
            amounts?: readonly VariantAmount[],
            user?: string
        ): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.DetailsUpdate, { group, name, year, amounts, user });
            }
        },
        [request]
    );
}
