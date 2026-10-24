import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { Product, ProductYearIdentity } from '~/schema';
import { getProductHistory } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';

export function useGetProductHistory({ group, name, year }: ProductYearIdentity): () => Promise<void> {
    const client = useQueryClient();
    return useCallback(async (): Promise<void> => {
        if (!group || !name) {
            return;
        }
        const history = await getProductHistory({ group, name, year });
        client.setQueryData<readonly Product[]>(CATALOG_KEYS.products, (products) =>
            products?.map((product) =>
                product.group === group && product.name === name
                    ? { ...product, history: { ...product.history, [year]: history } }
                    : product
            )
        );
    }, [client, group, name, year]);
}
