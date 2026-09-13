import { API } from '@rusys/common/api/v1';
import type { UpdateVariant } from '@rusys/common/data';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetVariants } from '~/client/state/variants/useGetVariants';

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
