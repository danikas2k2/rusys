import { useCallback } from 'react';
import { type ApiRequestDetails, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

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
