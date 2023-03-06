import { api } from '@config';
import { useCallback } from 'react';
import useRefreshResponse from '~/store/details/useRefreshResponse';

export default function useDetailsRequest(): (url: string, data?: object) => Promise<void> {
    const refreshResponse = useRefreshResponse();
    return useCallback(
        async (url: string, data?: object): Promise<void> =>
            refreshResponse(
                fetch(`${api}/${url}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data ?? {}),
                })
            ),
        [refreshResponse]
    );
}
