import { API } from '@rusys/common/api/v1';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetVariants } from '~/client/state/variants/useGetVariants';

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
