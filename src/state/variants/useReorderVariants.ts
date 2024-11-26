import { useCallback } from 'react';
// import { useDispatch } from 'react-redux';
import { type ApiReorderVariants, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

// import { reorderVariantsAction } from '~/state/variants/actions';

export function useReorderVariants(): (group: string, variants: Readonly<Record<string, number>>) => Promise<void> {
    // const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiReorderVariants>();
    return useCallback(
        async (group: string, variants: Readonly<Record<string, number>>): Promise<void> => {
            if (Object.keys(variants).length) {
                // dispatch(reorderVariantsAction(group, variants));
                return request(ApiUrl.VariantsReorder, { group, variants });
            }
        },
        [request /*, dispatch*/]
    );
}
