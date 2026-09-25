import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

export function useGetSummary(): () => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback(() => request(API.summary()), [request]);
}
