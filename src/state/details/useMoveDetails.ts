import { useCallback } from 'react';
import { type ApiMoveDetails, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useMoveDetails(): (group: string, name: string, newGroup: string, newName?: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiMoveDetails>();
    return useCallback(
        async (group: string, name: string, newGroup: string, newName?: string): Promise<void> => {
            if (group && name && newGroup && group !== newGroup) {
                return request(ApiUrl.DetailsMove, { group, name, newGroup, newName });
            }
        },
        [request]
    );
}
