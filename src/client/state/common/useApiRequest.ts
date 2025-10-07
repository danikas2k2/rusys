import { useCallback } from 'react';

import axios from 'axios';

export type RequestMethod =
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH'
    | 'MOVE';

export function useApiRequest(): <R, D = object | string>(url: string, data?: D, method?: RequestMethod) => Promise<R> {
    return useCallback(async <R, D = object | string>(url: string, data?: D, method?: RequestMethod): Promise<R> => {
        if (typeof data === 'string') {
            if (typeof method === 'string') {
                data = { data } as D;
            } else {
                method = data as RequestMethod;
                data = undefined;
            }
        }
        const response = await axios({
            url,
            method: method ?? 'POST',
            responseType: 'json',
            data,
            ...(data instanceof FormData
                ? {
                      headers: { 'Content-Type': 'multipart/form-data' },
                  }
                : {}),
        });
        return response.data;
    }, []);
}
