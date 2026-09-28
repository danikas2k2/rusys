import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetVariants } from '~/store/variants/useGetVariants';

export function useDeleteVariant(): (group: string, variant: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetVariants();
    return useCallback(
        async (group: string, variant: string): Promise<void> => {
            if (group && variant) {
                await request(API.groupVariant(group, variant), undefined, 'DELETE');
                await refresh();
            }
        },
        [refresh, request]
    );
}
