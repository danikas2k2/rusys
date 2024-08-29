import { useCallback } from 'react';
import { type ApiUpdateDetailsYears, ApiUrl } from '~/common/api';
import { type YearAmounts } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useSetDetailsYears(): (
    group: string,
    name: string,
    years?: YearAmounts[],
    withoutHistory?: boolean
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateDetailsYears>();
    return useCallback(
        async (group: string, name: string, years?: YearAmounts[], withoutHistory?: boolean): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.DetailsSetYears, { group, name, years, withoutHistory });
            }
        },
        [request]
    );
}
