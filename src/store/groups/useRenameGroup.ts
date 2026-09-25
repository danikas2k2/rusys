import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetGroups } from '~/store/groups/useGetGroups';

export function useRenameGroup(): (
    group: string,
    newGroup: string,
    annual?: boolean,
    review?: boolean,
    image?: string
) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetGroups();
    return useCallback(
        async (group: string, newGroup: string, annual?: boolean, review?: boolean, image?: string): Promise<void> => {
            if (group && newGroup && group !== newGroup) {
                await request(API.group(group), { name: newGroup, annual, review, image }, 'PATCH');
                await refresh();
            }
        },
        [refresh, request]
    );
}
