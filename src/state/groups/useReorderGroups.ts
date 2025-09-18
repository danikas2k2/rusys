import { useCallback } from 'react';

import { isEmpty } from 'lodash';

import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiReorderGroups } from '~/types/api';

export function useReorderGroups(): (groups: Readonly<Record<string, number>>) => Promise<void> {
    const request = useUpdatingApiRequest<ApiReorderGroups>();
    return useCallback(
        async (groups: Readonly<Record<string, number>>): Promise<void> => {
            if (!isEmpty(groups)) {
                return request(ApiUrl.GroupsReorder, { groups });
            }
        },
        [request]
    );
}
