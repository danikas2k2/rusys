import { useCallback } from 'react';
import { ApiUrl, type ApiRequestVariant } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useDeleteVariant(): (group: string, variant: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRequestVariant>();
    return useCallback(
        async (group: string, variant: string): Promise<void> => request(ApiUrl.VariantsDelete, { group, variant }),
        [request]
    );
}
