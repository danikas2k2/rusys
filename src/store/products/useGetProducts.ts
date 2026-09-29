import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

export function useGetProducts(): (initial?: boolean) => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback(
        async (initial?: boolean): Promise<void> => {
            if (initial) {
                await Promise.all([
                    request(API.products(), true),
                    request(API.groups(), true),
                    request(API.variants(), true),
                ]);
            } else {
                await request(API.products());
            }
        },
        [request]
    );
}
