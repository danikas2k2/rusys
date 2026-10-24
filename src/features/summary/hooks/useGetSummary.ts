import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { readSummary } from '~/server/actions/summary';
import { setCatalogData } from '~/store/catalog';

export function useGetSummary(): (initial?: boolean) => Promise<void> {
    const client = useQueryClient();
    return useCallback(async (): Promise<void> => {
        setCatalogData(client, await readSummary());
    }, [client]);
}
