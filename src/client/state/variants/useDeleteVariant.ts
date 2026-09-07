import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetVariants } from '~/client/state/variants/useGetVariants';

export function useDeleteVariant(): (group: string, variant: string) => Promise<void> {
    const request = useUpdatingApiRequest();
    const refresh = useGetVariants();
    return useCallback(
        async (group: string, variant: string): Promise<void> => {
            if (group && variant) {
                await request(API.groupVariant(group, variant), undefined, 'DELETE');
                await refresh();
            }
        },
        [refresh, request]
    );
}
