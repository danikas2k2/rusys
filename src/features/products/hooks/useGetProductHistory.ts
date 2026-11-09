import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { Product, ProductYearIdentity } from '~/schema';
import { getProductHistory } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';

const historyGeneration = new WeakMap<QueryClient, Map<string, number>>();
const historyKey = ({ group, name, year }: ProductYearIdentity) => JSON.stringify([group, name, year]);

export function invalidatePendingProductHistory(client: QueryClient, identity: ProductYearIdentity): void {
    const generations = historyGeneration.get(client) ?? new Map<string, number>();
    const key = historyKey(identity);
    generations.set(key, (generations.get(key) ?? 0) + 1);
    historyGeneration.set(client, generations);
}

export function useGetProductHistory({ group, name, year }: ProductYearIdentity): () => Promise<void> {
    const client = useQueryClient();
    return useCallback(async (): Promise<void> => {
        if (!group || !name) {
            return;
        }
        const key = historyKey({ group, name, year });
        const generation = historyGeneration.get(client)?.get(key) ?? 0;
        const history = await getProductHistory({ group, name, year });
        if ((historyGeneration.get(client)?.get(key) ?? 0) !== generation) {
            return;
        }
        client.setQueryData<readonly Product[]>(CATALOG_KEYS.products, (products) =>
            products?.map((product) =>
                product.group === group && product.name === name
                    ? { ...product, history: { ...product.history, [year]: history } }
                    : product
            )
        );
    }, [client, group, name, year]);
}
