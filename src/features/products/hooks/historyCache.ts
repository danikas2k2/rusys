import { skipToken, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import type { Product, ProductIdentity, Summary } from '~/schema';
import { CATALOG_KEYS } from '~/store/catalog';

const revisions = new WeakMap<QueryClient, Map<string, number>>();
const identityKey = ({ group, name }: ProductIdentity) => JSON.stringify([group, name]);
const revisionKey = ({ group, name }: ProductIdentity) => ['history-revision', group, name] as const;

export function getHistoryRevision(client: QueryClient, identity: ProductIdentity): number {
    return revisions.get(client)?.get(identityKey(identity)) ?? 0;
}

export function useHistoryRevision(identity: ProductIdentity): number {
    const client = useQueryClient();
    return (
        useQuery({
            queryKey: revisionKey(identity),
            queryFn: skipToken,
            initialData: () => getHistoryRevision(client, identity),
            enabled: false,
        }).data ?? 0
    );
}

// A stock cohort can be consumed in several different periods, so invalidate every cached
// year in both views for this product, rather than guessing a matching consumption year.
export function invalidateProductHistories(client: QueryClient, identity: ProductIdentity): void {
    const values = revisions.get(client) ?? new Map<string, number>();
    const revision = getHistoryRevision(client, identity) + 1;
    values.set(identityKey(identity), revision);
    revisions.set(client, values);

    const clear = <T extends Product | Summary>(items: readonly T[] | undefined): readonly T[] | undefined =>
        items?.map((item) => {
            if (item.group !== identity.group || item.name !== identity.name) {
                return item;
            }
            const { history: _history, ...remaining } = item;
            return remaining as T;
        });
    client.setQueryData<readonly Product[]>(CATALOG_KEYS.products, clear);
    client.setQueryData<readonly Summary[]>(CATALOG_KEYS.summary, clear);
    client.setQueryData(revisionKey(identity), revision);
}
