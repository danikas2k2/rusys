import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

export function useGetVariants(): () => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback(async (): Promise<void> => {
        await Promise.all([request(API.variants()), request(API.groups())]);
    }, [request]);
}
