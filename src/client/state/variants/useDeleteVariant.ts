import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiRequestVariant } from '~/common/api';

export function useDeleteVariant(): (group: string, variant: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRequestVariant>();
    return useCallback(
        async (group: string, variant: string): Promise<void> => {
            if (group && variant) {
                return request(ApiUrl.VariantsDelete, { group, variant });
            }
        },
        [request]
    );
}
