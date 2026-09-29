import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';

export function useSuspenseApiRequest(): (url: string, initial?: boolean) => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(async (url: string): Promise<void> => request(url, 'GET'), [request]);
}
