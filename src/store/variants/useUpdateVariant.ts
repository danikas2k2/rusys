import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import type { UpdateVariant } from '~/common/data';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetVariants } from '~/store/variants/useGetVariants';

export function useUpdateVariant(): (group: string, variant: string, update: UpdateVariant) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetVariants();
    return useCallback(
        async (group: string, variant: string, update: UpdateVariant): Promise<void> => {
            if (group && variant) {
                await request(API.groupVariant(group, variant), update, 'PATCH');
                await refresh();
            }
        },
        [refresh, request]
    );
}
