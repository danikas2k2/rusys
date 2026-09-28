import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetVariants } from '~/store/variants/useGetVariants';

export function useReorderVariants(): (group: string, variants: Readonly<Record<string, number>>) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetVariants();
    return useCallback(
        async (group: string, variants: Readonly<Record<string, number>>): Promise<void> => {
            if (group && !isEmpty(variants)) {
                await request(API.groupVariantOrder(group), { variants }, 'PUT');
                await refresh();
            }
        },
        [refresh, request]
    );
}
