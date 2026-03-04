import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiRequestHistory } from '~/types/api';

export function useDeleteHistory(): (
    time: number,
    group: string,
    name: string,
    year?: number,
    user?: string
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRequestHistory>();
    return useCallback(
        async (time: number, group: string, name: string, year?: number, user?: string): Promise<void> => {
            if (time && group && name) {
                return request(ApiUrl.HistoryDelete, { time, group, name, year, user });
            }
        },
        [request]
    );
}
