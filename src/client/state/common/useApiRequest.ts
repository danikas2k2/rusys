import axios from 'axios';
import { useCallback } from 'react';

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

export type ResponseType = 'json' | 'blob';

export function useApiRequest(): <R, D = object | string>(
    url: string,
    data?: D,
    method?: RequestMethod,
    responseType?: ResponseType
) => Promise<R> {
    return useCallback(
        async <R, D = object | string>(
            url: string,
            data?: D,
            method?: RequestMethod,
            responseType: ResponseType = 'json'
        ): Promise<R> => {
            if (typeof data === 'string') {
                if (typeof method === 'string') {
                    // oxlint-disable-next-line no-param-reassign
                    data = { data } as D;
                } else {
                    // oxlint-disable-next-line no-param-reassign
                    method = data as RequestMethod;
                    // oxlint-disable-next-line no-param-reassign
                    data = undefined;
                }
            }

            const response = await axios({
                url,
                method: method ?? 'POST',
                responseType,
                data,
                ...(data instanceof FormData
                    ? {
                          headers: { 'Content-Type': 'multipart/form-data' },
                      }
                    : {}),
            });

            return response.data;
        },
        []
    );
}
