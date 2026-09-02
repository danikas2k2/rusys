import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiSetParent } from '~/common/api';

export function useSetProductParent(): (group: string, name: string, parent?: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiSetParent>();
    return useCallback(
        async (group: string, name: string, parent?: string): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsSetParent, { group, name, parent });
            }
        },
        [request]
    );
}
