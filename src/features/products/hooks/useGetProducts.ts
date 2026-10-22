import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getProductsAction } from '~/server/actions/products';
import { setCatalogData } from '~/store/catalog';

export function useGetProducts(): (initial?: boolean) => Promise<void> {
    const client = useQueryClient();
    return useCallback(async (): Promise<void> => {
        const data = await getProductsAction();
        setCatalogData(client, data);
    }, [client]);
}
