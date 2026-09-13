import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useGetVariants(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(async (): Promise<void> => {
        await Promise.all([request(API.variants(), 'GET'), request(API.groups(), 'GET')]);
    }, [request]);
}
