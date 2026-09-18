import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useSuspenseApiRequest } from '~/client/state/common/useSuspenseApiRequest';

export function useGetProducts(): () => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback(async (): Promise<void> => {
        await Promise.all([request(API.products()), request(API.groups()), request(API.variants())]);
    }, [request]);
}
