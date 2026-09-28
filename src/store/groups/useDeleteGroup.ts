import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetGroups } from '~/store/groups/useGetGroups';

export function useDeleteGroup(): (group: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetGroups();
    return useCallback(
        async (group: string): Promise<void> => {
            if (group) {
                await request(API.group(group), undefined, 'DELETE');
                await refresh();
            }
        },
        [refresh, request]
    );
}
