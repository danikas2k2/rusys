import { ApiUrl, type ApiCopyVariant } from '@rusys/common/api';
import type { UpdateVariant } from '@rusys/common/data';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useCopyVariant(): (
    group: string,
    variant: string,
    newGroup: string,
    newVariant?: string,
    update?: UpdateVariant
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiCopyVariant>();
    return useCallback(
        async (group, variant, newGroup, newVariant, update): Promise<void> => {
            if (group && variant && newGroup && (group !== newGroup || (newVariant && variant !== newVariant))) {
                return request(ApiUrl.VariantsCopy, {
                    group,
                    variant,
                    newGroup,
                    ...(newVariant && { newVariant }),
                    ...update,
                });
            }
        },
        [request]
    );
}
