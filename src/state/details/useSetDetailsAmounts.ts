import { useCallback } from 'react';
import { type ApiUpdateDetailsAmounts, ApiUrl } from '~/common/api';
import { type VariantAmount } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useSetDetailsAmounts(): (
    group: string,
    name: string,
    year: number,
    amounts?: ReadonlyArray<VariantAmount>,
    withoutHistory?: boolean
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateDetailsAmounts>();
    return useCallback(
        async (
            group: string,
            name: string,
            year: number,
            amounts?: ReadonlyArray<VariantAmount>,
            withoutHistory?: boolean
        ): Promise<void> => {
            if (group && name && year) {
                return request(ApiUrl.DetailsSetAmounts, { group, name, year, amounts, withoutHistory });
            }
        },
        [request]
    );
}
