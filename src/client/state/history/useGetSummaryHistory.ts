import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useGetSummaryHistory(year: number, group?: string, name?: string): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(async (): Promise<void> => {
        if (!group || !name) {
            return;
        }
        await request(API.summaryHistory(group, name, year), undefined, 'GET');
    }, [group, name, request, year]);
}
