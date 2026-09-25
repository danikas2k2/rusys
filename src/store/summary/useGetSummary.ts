import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

export function useGetSummary(): () => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback(() => request(API.summary()), [request]);
}
