import { useCallback } from 'react';
import { ApiUrl, type ApiReorderVariants } from '~/common/api';
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
