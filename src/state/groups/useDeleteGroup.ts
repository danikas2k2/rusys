import { useCallback } from 'react';
import { type ApiRequestGroup, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useDeleteGroup(): (group: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRequestGroup>();
    return useCallback(
        async (group: string): Promise<void> => {
            if (group) {
                return request(ApiUrl.GroupsDelete, { group });
            }
        },
        [request]
    );
}
