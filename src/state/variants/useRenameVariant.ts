import { useCallback } from 'react';
import { type ApiRenameVariant, ApiUrl } from '~/common/api';
import type { UpdateVariant } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useRenameVariant(): (
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRenameVariant>();
    return useCallback(
        async (group, variant, newVariant, update): Promise<void> => {
            if (newVariant && variant !== newVariant) {
                return request(ApiUrl.VariantsRename, { group, variant, newVariant, ...update });
            }
        },
        [request]
    );
}
