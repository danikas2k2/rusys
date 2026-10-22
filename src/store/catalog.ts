import type { QueryClient } from '@tanstack/react-query';

import type { Product, Summary } from '~/common/data';
import type { InitialAppData } from '~/components/app/initialData';

export const CATALOG_KEYS = {
    groups: ['catalog', 'groups'] as const,
    products: ['catalog', 'products'] as const,
    variants: ['catalog', 'variants'] as const,
    summary: ['catalog', 'summary'] as const,
    years: ['catalog', 'years'] as const,
};

function preserveHistory<T extends Product | Summary>(
    current: readonly T[] | undefined,
    incoming: readonly T[]
): readonly T[] {
    return incoming.map((item) => {
        const previous = current?.find((value) => value.group === item.group && value.name === item.name);
        return previous?.history ? { ...item, history: previous.history } : item;
    });
}

export function setCatalogData(client: QueryClient, data: InitialAppData): void {
    if (data.groups) {
        client.setQueryData(CATALOG_KEYS.groups, data.groups);
    }
    if (data.variants) {
        client.setQueryData(CATALOG_KEYS.variants, data.variants);
    }
    if (data.years) {
        client.setQueryData(CATALOG_KEYS.years, data.years);
    }
    if (data.products) {
        client.setQueryData<readonly Product[]>(CATALOG_KEYS.products, (current) =>
            preserveHistory(current, data.products!)
        );
    }
    if (data.summary) {
        client.setQueryData<readonly Summary[]>(CATALOG_KEYS.summary, (current) =>
            preserveHistory(current, data.summary!)
        );
    }
}
