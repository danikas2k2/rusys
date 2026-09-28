import { useCallback } from 'react';

import { useUpdateStateFromResponse, type RefreshResult } from '~/store/base/useUpdateStateFromResponse';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';

/**
 * Reads API data for a Suspense resource. Mutations continue to use
 * useUpdatingApiRequest because they need request bodies and response types.
 */
export function useSuspenseApiRequest(): (url: string) => Promise<void> {
    const update = useUpdateStateFromResponse();
    const request = useUpdatingApiRequest();

    return useCallback(
        async (url: string): Promise<void> => {
            let response: Response;
            try {
                response = await fetch(url);
            } catch (error) {
                // Node's fetch rejects relative URLs. The browser accepts these API paths,
                // while the fallback keeps non-browser callers compatible with the existing
                // request implementation.
                if (error instanceof TypeError && error.message.includes('URL')) {
                    await request(url, 'GET');
                    return;
                }
                throw error;
            }
            if (!response.ok) {
                throw new Error(`Failed to load data (${response.status})`);
            }

            await update((await response.json()) as RefreshResult);
        },
        [request, update]
    );
}
