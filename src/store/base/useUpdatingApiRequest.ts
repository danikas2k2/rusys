import { useCallback } from 'react';

import { requestData } from '~/server/actions/requestData';

type RequestMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function useUpdatingApiRequest<T = object | string>(): (
    url: string,
    data?: T,
    method?: RequestMethod
) => Promise<void> {
    return useCallback(async (url, data, method): Promise<void> => {
        const actualMethod = typeof data === 'string' && method === undefined ? data : (method ?? 'POST');
        const body = typeof data === 'string' ? (method ? { data } : undefined) : data;
        await requestData(url, actualMethod, body);
    }, []);
}
