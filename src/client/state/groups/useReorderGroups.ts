import { API } from '@rusys/common/api/v1';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetGroups } from '~/client/state/groups/useGetGroups';

export function useReorderGroups(): (groups: Readonly<Record<string, number>>) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetGroups();
    return useCallback(
        async (groups: Readonly<Record<string, number>>): Promise<void> => {
            if (!isEmpty(groups)) {
                await request(API.groupOrder(), { groups }, 'PUT');
                await refresh();
            }
        },
        [refresh, request]
    );
}
