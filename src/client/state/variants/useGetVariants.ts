import { ApiV1 } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useGetVariants(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(async (): Promise<void> => {
        await Promise.all([request(ApiV1.variants, 'GET'), request(ApiV1.groups, 'GET')]);
    }, [request]);
}
