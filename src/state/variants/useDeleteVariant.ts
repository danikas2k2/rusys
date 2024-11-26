import { useCallback } from 'react';
// import { useDispatch } from 'react-redux';
import { type ApiRequestVariant, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

// import { deleteVariantAction } from '~/state/variants/actions';

export function useDeleteVariant(): (group: string, variant: string) => Promise<void> {
    // const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiRequestVariant>();
    return useCallback(
        async (group: string, variant: string): Promise<void> => {
            // dispatch(deleteVariantAction(group, variant));
            return request(ApiUrl.VariantsDelete, { group, variant });
        },
        [request /*, dispatch*/]
    );
}
