import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiUpdateGroup } from '~/types/api';

export function useUpdateGroup(): (group: string, annual?: boolean) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateGroup>();
    return useCallback(
        async (group: string, annual?: boolean): Promise<void> => {
            if (group) {
                return request(ApiUrl.GroupsUpdate, { group, annual });
            }
        },
        [request]
    );
}
