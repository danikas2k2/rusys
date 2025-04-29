import { useCallback } from 'react';
import { ApiUrl, type ApiRenameDetails } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useRenameDetails(): (group: string, name: string, newName: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRenameDetails>();
    return useCallback(
        async (group: string, name: string, newName: string): Promise<void> => {
            if (group && name && newName && name !== newName) {
                return request(ApiUrl.DetailsRename, { group, name, newName });
            }
        },
        [request]
    );
}
