import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiMoveHistory } from '~/types/api';

export function useMoveHistory(): (
    time: number,
    group: string,
    name: string,
    year: number,
    newGroup?: string,
    newName?: string,
    newYear?: number
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiMoveHistory>();
    return useCallback(
        async (
            time: number,
            group: string,
            name: string,
            year: number,
            newGroup?: string,
            newName?: string,
            newYear?: number
        ): Promise<void> => {
            if (
                time &&
                group &&
                name &&
                (newGroup || newName || newYear) &&
                (!newGroup || group !== newGroup) &&
                (!newName || name !== newName) &&
                (!newYear || year !== newYear)
            ) {
                return request(ApiUrl.HistoryMove, { time, group, name, year, newGroup, newName, newYear });
            }
        },
        [request]
    );
}
