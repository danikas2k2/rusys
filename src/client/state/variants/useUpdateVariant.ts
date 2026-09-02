import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiUpdateVariant } from '~/common/api';
import type { UpdateVariant } from '~/common/data';

export function useUpdateVariant(): (group: string, variant: string, update: UpdateVariant) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateVariant>();
    return useCallback(
        async (group: string, variant: string, update: UpdateVariant): Promise<void> => {
            if (group && variant) {
                return request(ApiUrl.VariantsUpdate, { group, variant, ...update });
            }
        },
        [request]
    );
}
