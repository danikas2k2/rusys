import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useGetSummary(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(() => request(API.summary(), 'GET'), [request]);
}
