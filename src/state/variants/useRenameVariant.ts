import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiRenameVariant, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { renameVariantAction } from '~/state/variants/actions';

export function useRenameVariant(): (group: string, variant: string, newVariant: string) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiRenameVariant>();
    return useCallback(
        async (group: string, variant: string, newVariant: string): Promise<void> => {
            if (newVariant && variant !== newVariant) {
                dispatch(renameVariantAction(group, variant, newVariant));
                return request(ApiUrl.VariantsRename, { group, variant, newVariant });
            }
        },
        [request, dispatch]
    );
}
