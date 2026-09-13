import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetGroups } from '~/client/state/groups/useGetGroups';

export function useUpdateGroup(): (group: string, annual?: boolean, review?: boolean, image?: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetGroups();
    return useCallback(
        async (group: string, annual?: boolean, review?: boolean, image?: string): Promise<void> => {
            if (group) {
                await request(API.group(group), { annual, review, image }, 'PUT');
                await refresh();
            }
        },
        [refresh, request]
    );
}
