import { useCallback } from 'react';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiRenameGroup } from '~/types/api';

export function useRenameGroup(): (group: string, newGroup: string, annual?: boolean) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRenameGroup>();
    return useCallback(
        async (group: string, newGroup: string, annual?: boolean): Promise<void> => {
            if (group && newGroup && group !== newGroup) {
                return request(ApiUrl.GroupsRename, { group, newGroup, annual });
            }
        },
        [request]
    );
}
