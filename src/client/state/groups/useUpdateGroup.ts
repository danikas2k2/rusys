import { ApiUrl, type ApiUpdateGroup } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useUpdateGroup(): (group: string, annual?: boolean, review?: boolean, image?: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateGroup>();
    return useCallback(
        async (group: string, annual?: boolean, review?: boolean, image?: string): Promise<void> => {
            if (group) {
                return request(ApiUrl.GroupsUpdate, { group, annual, review, image });
            }
        },
        [request]
    );
}
