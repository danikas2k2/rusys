import { useCallback } from 'react';
import { ApiUrl, type ApiUpdateVariant } from '~/common/api';
import { type UpdateVariant } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useUpdateVariant(): (group: string, variant: string, update: UpdateVariant) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUpdateVariant>();
    return useCallback(
        async (group: string, variant: string, update: UpdateVariant): Promise<void> => {
            return request(ApiUrl.VariantsUpdate, { group, variant, ...update });
        },
        [request]
    );
}
