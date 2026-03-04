import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiUpdateHistory } from '~/types/api';
import type { VariantAmount } from '~/types/data';

export function useUpdateHistory(): (
    time: number,
    group: string,
    name: string,
    year?: number,
    amounts?: readonly VariantAmount[],
    user?: string
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateHistory>();
    return useCallback(
        async (
            time: number,
            group: string,
            name: string,
            year?: number,
            amounts?: readonly VariantAmount[],
            user?: string
        ): Promise<void> => {
            if (time && group && name) {
                return request(ApiUrl.HistoryUpdate, { time, group, name, year, amounts, user });
            }
        },
        [request]
    );
}
