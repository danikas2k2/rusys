import { ApiUrl, type ApiRenameGroup } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useRenameGroup(): (
    group: string,
    newGroup: string,
    annual?: boolean,
    review?: boolean,
    image?: string
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRenameGroup>();
    return useCallback(
        async (group: string, newGroup: string, annual?: boolean, review?: boolean, image?: string): Promise<void> => {
            if (group && newGroup && group !== newGroup) {
                return request(ApiUrl.GroupsRename, { group, newGroup, annual, review, image });
            }
        },
        [request]
    );
}
