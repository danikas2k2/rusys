import { useCallback } from 'react';

import { useUpdateStateFromResponse, type RefreshResult } from '~/store/base/useUpdateStateFromResponse';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';

export function useSuspenseApiRequest(): (url: string, initial?: boolean) => Promise<void> {
    const update = useUpdateStateFromResponse();
    const request = useUpdatingApiRequest();

    return useCallback(
        async (url: string, initial?: boolean): Promise<void> => {
            if (!initial) {
                await request(url, 'GET');
                return;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load data (${response.status})`);
            }

            await update((await response.json()) as RefreshResult);
        },
        [request, update]
    );
}
