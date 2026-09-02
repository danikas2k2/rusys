import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl } from '~/common/api';

export function useGetSummary(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(() => request(ApiUrl.Summary), [request]);
}
