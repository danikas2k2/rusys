import { ApiV1 } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useGetSummary(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(() => request(ApiV1.summary, 'GET'), [request]);
}
