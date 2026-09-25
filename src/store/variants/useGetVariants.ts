import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

export function useGetVariants(): () => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback(async (): Promise<void> => {
        await Promise.all([request(API.variants()), request(API.groups())]);
    }, [request]);
}
