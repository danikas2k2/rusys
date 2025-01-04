import { useCallback } from 'react';
import { type ApiReorderVariants, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useReorderVariants(): (group: string, variants: Readonly<Record<string, number>>) => Promise<void> {
    const request = useUpdatingApiRequest<ApiReorderVariants>();
    return useCallback(
        async (group: string, variants: Readonly<Record<string, number>>): Promise<void> => {
            if (Object.keys(variants).length) {
                return request(ApiUrl.VariantsReorder, { group, variants });
            }
        },
        [request]
    );
}
