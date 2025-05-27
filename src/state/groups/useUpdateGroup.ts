import { useCallback } from 'react';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiUpdateGroup } from '~/types/api';

export function useUpdateGroup(): (group: string, order?: number) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateGroup>();
    return useCallback(
        async (group: string, order?: number): Promise<void> => {
            if (group) {
                return request(ApiUrl.GroupsUpdate, { group, order });
            }
        },
        [request]
    );
}
