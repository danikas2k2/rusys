import { useCallback } from 'react';
import { ApiUrl, type ApiRenameGroup } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useRenameGroup(): (group: string, newGroup: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRenameGroup>();
    return useCallback(
        async (group: string, newGroup: string): Promise<void> => {
            if (group && newGroup && group !== newGroup) {
                return request(ApiUrl.GroupsRename, { group, newGroup });
            }
        },
        [request]
    );
}
