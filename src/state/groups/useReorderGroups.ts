import { useCallback } from 'react';
import { ApiUrl, type ApiReorderGroups } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useReorderGroups(): (groups: Readonly<Record<string, number>>) => Promise<void> {
    const request = useUpdatingApiRequest<ApiReorderGroups>();
    return useCallback(
        async (groups: Readonly<Record<string, number>>): Promise<void> => {
            if (Object.keys(groups).length) {
                return request(ApiUrl.GroupsReorder, { groups });
            }
        },
        [request]
    );
}
