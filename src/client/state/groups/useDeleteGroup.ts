import { ApiUrl, type ApiRequestGroup } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

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
