import { API } from '@rusys/common/api/v1';
import type { UpdateVariant } from '@rusys/common/data';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetVariants } from '~/store/variants/useGetVariants';

export function useRenameVariant(): (
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant
) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetVariants();
    return useCallback(
        async (group, variant, newVariant, update): Promise<void> => {
            if (group && variant && newVariant && variant !== newVariant) {
                await request(API.groupVariant(group, variant), { name: newVariant, ...update }, 'PATCH');
                await refresh();
            }
        },
        [refresh, request]
    );
}
