import { useCallback } from 'react';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { ApiUrl } from '~/types/api';

export function useGetDetails(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(async (): Promise<void> => request(ApiUrl.Details), [request]);
}
