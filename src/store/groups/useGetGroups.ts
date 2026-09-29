import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

export function useGetGroups(): (initial?: boolean) => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback(async (initial?: boolean): Promise<void> => request(API.groups(), initial), [request]);
}
