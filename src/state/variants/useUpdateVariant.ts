import { useCallback } from 'react';
// import { useDispatch } from 'react-redux';
import { type ApiUpdateVariant, ApiUrl } from '~/common/api';
import { type UpdateVariant } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
// import { updateVariantAction } from '~/state/variants/actions';

export function useUpdateVariant(): (group: string, variant: string, update: UpdateVariant) => Promise<void> {
    // const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiUpdateVariant>();
    return useCallback(
        async (group: string, variant: string, update: UpdateVariant): Promise<void> => {
            // dispatch(updateVariantAction(group, variant, update));
            return request(ApiUrl.VariantsUpdate, { group, variant, ...update });
        },
        [request /*, dispatch*/]
    );
}
