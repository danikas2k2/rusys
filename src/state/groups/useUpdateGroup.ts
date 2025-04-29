import { useCallback } from 'react';
import { ApiUrl, type ApiUpdateGroup } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useUpdateGroup(): (group: string, order?: number) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateGroup>();
    return useCallback(
        async (group: string, order?: number): Promise<void> => request(ApiUrl.GroupsUpdate, { group, order }),
        [request]
    );
}
