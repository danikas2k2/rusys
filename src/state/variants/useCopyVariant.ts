import { useCallback } from 'react';
import { type ApiCopyVariant, ApiUrl } from '~/common/api';
import { type UpdateVariant } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

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
            if (newGroup && group !== newGroup) {
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
