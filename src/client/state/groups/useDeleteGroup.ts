import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiRequestGroup } from '~/types/api';

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
