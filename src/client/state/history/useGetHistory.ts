import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl } from '~/types/api';

export function useGetHistory(year: number, group?: string, name?: string): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(
        async (): Promise<void> => request(ApiUrl.History, { year, group, name }),
        [group, name, request, year]
    );
}
