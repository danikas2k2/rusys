import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

export function useGetProductHistory(year: number, group?: string, name?: string): () => Promise<void> {
    const request = useSuspenseApiRequest();
    return useCallback(async (): Promise<void> => {
        if (!group || !name) {
            return;
        }
        await request(API.productHistory(group, name, year));
    }, [group, name, request, year]);
}
