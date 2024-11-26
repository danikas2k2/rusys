import { useCallback } from 'react';
// import { useDispatch } from 'react-redux';
import { type ApiRenameVariant, ApiUrl } from '~/common/api';
import type { UpdateVariant } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

// import { renameVariantAction } from '~/state/variants/actions';

export function useRenameVariant(): (
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant
) => Promise<void> {
    // const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiRenameVariant>();
    return useCallback(
        async (group, variant, newVariant, update): Promise<void> => {
            if (newVariant && variant !== newVariant) {
                // dispatch(renameVariantAction(group, variant, newVariant, update));
                return request(ApiUrl.VariantsRename, { group, variant, newVariant, ...update });
            }
        },
        [request /*, dispatch*/]
    );
}
