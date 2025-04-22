import { useCallback } from 'react';
import { ApiUrl, type ApiUpdateDetails } from '~/common/api';
import { type VariantAmount } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useUpdateDetails(): (
    group: string,
    name: string,
    year: number,
    amounts?: ReadonlyArray<VariantAmount>
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateDetails>();
    return useCallback(
        async (group: string, name: string, year: number, amounts?: ReadonlyArray<VariantAmount>): Promise<void> => {
            if (group && name && year) {
                return request(ApiUrl.DetailsUpdate, { group, name, year, amounts });
            }
        },
        [request]
    );
}
