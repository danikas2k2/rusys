import { useCallback } from 'react';
// import { useDispatch } from 'react-redux';
import { type ApiCopyVariant, ApiUrl } from '~/common/api';
import { type UpdateVariant } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
// import { copyVariantAction } from '~/state/variants/actions';

export function useCopyVariant(): (
    group: string,
    variant: string,
    newGroup: string,
    newVariant?: string,
    update?: UpdateVariant
) => Promise<void> {
    // const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiCopyVariant>();
    return useCallback(
        async (group, variant, newGroup, newVariant, update): Promise<void> => {
            if (newGroup && group !== newGroup) {
                // dispatch(copyVariantAction(group, variant, newGroup, newVariant, update));
                return request(ApiUrl.VariantsCopy, {
                    group,
                    variant,
                    newGroup,
                    ...(newVariant && { newVariant }),
                    ...update,
                });
            }
        },
        [request /*, dispatch*/]
    );
}
