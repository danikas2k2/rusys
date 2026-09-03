import { ApiUrl, type ApiRenameVariant } from '@rusys/common/api';
import type { UpdateVariant } from '@rusys/common/data';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useRenameVariant(): (
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant
) => Promise<void> {
    const request = useUpdatingApiRequest<ApiRenameVariant>();
    return useCallback(
        async (group, variant, newVariant, update): Promise<void> => {
            if (group && variant && newVariant && variant !== newVariant) {
                return request(ApiUrl.VariantsRename, { group, variant, newVariant, ...update });
            }
        },
        [request]
    );
}
