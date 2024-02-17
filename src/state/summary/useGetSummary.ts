import { useCallback } from 'react';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useGetSummary(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(() => request(ApiUrl.Summary), [request]);
}
