import { ApiV1 } from '@rusys/common/api/v1';
import type { UpdateVariant } from '@rusys/common/data';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetVariants } from '~/client/state/variants/useGetVariants';

export function useCopyVariant(): (
    group: string,
    variant: string,
    newGroup: string,
    newVariant?: string,
    update?: UpdateVariant
) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetVariants();
    return useCallback(
        async (group, variant, newGroup, newVariant, update): Promise<void> => {
            if (group && variant && newGroup && (group !== newGroup || (newVariant && variant !== newVariant))) {
                await request(
                    ApiV1.groupVariantCopies(group, variant),
                    {
                        newGroup,
                        ...(newVariant && { newVariant }),
                        ...update,
                    },
                    'POST'
                );
                await refresh();
            }
        },
        [refresh, request]
    );
}
