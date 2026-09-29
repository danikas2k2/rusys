import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

export function useGetSummary(): (initial?: boolean) => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback((initial?: boolean) => request(API.summary(), initial), [request]);
}
