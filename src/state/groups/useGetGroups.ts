import { useCallback } from 'react';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useGetGroups(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(async (): Promise<void> => request(ApiUrl.Groups), [request]);
}
