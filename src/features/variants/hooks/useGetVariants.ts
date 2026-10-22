import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getVariantsAction } from '~/server/actions/variants';
import { setCatalogData } from '~/store/catalog';

export function useGetVariants(): (initial?: boolean) => Promise<void> {
    const client = useQueryClient();
    return useCallback(async (): Promise<void> => {
        const data = await getVariantsAction();
        setCatalogData(client, data);
    }, [client]);
}
