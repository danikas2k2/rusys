import { useCallback } from 'react';

export type RequestMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export function useApiRequest(): <T>(url: string, data?: object | string, method?: RequestMethod) => Promise<T> {
    return useCallback(async <T>(url: string, data?: object | string, method?: RequestMethod): Promise<T> => {
        if (typeof data === 'string') {
            if (typeof method === 'string') {
                data = { data };
            } else {
                method = data as RequestMethod;
                data = undefined;
            }
        }
        const response = await fetch(url, {
            method: method ?? (data == null ? 'GET' : 'POST'),
            ...(data == null && (!method || method.toUpperCase() === 'GET')
                ? {}
                : {
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data ?? {}),
                  }),
        });
        return await response.json();
    }, []);
}
