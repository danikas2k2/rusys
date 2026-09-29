import { useCallback } from 'react';
import type { ActionCreatorsMapObject } from 'redux';

import { requestData } from '~/server/actions/requestData';
import { useUpdateStateFromResponse } from '~/store/base/useUpdateStateFromResponse';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function useUpdatingApiRequest<T = object | string>(
    updateActions?: ActionCreatorsMapObject
): (url: string, data?: T, method?: RequestMethod) => Promise<void> {
    const update = useUpdateStateFromResponse(updateActions);
    return useCallback(
        async (url, data, method): Promise<void> => {
            const actualMethod = typeof data === 'string' && method === undefined ? data : (method ?? 'POST');
            const body = typeof data === 'string' ? (method ? { data } : undefined) : data;
            await update((await requestData(url, actualMethod, body)) as Parameters<typeof update>[0]);
        },
        [update]
    );
}
