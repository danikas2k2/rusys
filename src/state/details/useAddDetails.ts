import { useCallback } from 'react';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiRequestDetails } from '~/types/api';

export function useAddDetails(): (group: string, name: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRequestDetails>();
    return useCallback(
        async (group: string, name: string): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.DetailsAdd, { group, name });
            }
        },
        [request]
    );
}
