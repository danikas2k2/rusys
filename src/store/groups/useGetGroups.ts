import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

export function useGetGroups(): () => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback(async (): Promise<void> => request(API.groups()), [request]);
}
