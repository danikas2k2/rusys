import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { ApiUrl } from '~/types/api';

export function useGetSummary(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(() => request(ApiUrl.Summary), [request]);
}
