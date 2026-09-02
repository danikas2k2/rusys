import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiReorderVariants } from '~/common/api';

export function useReorderVariants(): (group: string, variants: Readonly<Record<string, number>>) => Promise<void> {
    const request = useUpdatingApiRequest<ApiReorderVariants>();
    return useCallback(
        async (group: string, variants: Readonly<Record<string, number>>): Promise<void> => {
            if (group && !isEmpty(variants)) {
                return request(ApiUrl.VariantsReorder, { group, variants });
            }
        },
        [request]
    );
}
