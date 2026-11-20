import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getHistoryRevision } from '~/features/products/hooks/historyCache';
import type { ProductHistory, ProductYearIdentity, Summary } from '~/schema';
import { getSummaryHistory } from '~/server/actions/summary';
import { CATALOG_KEYS } from '~/store/catalog';

export function useGetConsumedHistory(request: ProductYearIdentity): () => Promise<ProductHistory | undefined> {
    const client = useQueryClient();
    const { group, name, year } = request;
    return useCallback(async (): Promise<ProductHistory | undefined> => {
        if (!group || !name || !year) {
            return;
        }
        const requestRevision = getHistoryRevision(client, { group, name });
        const history = await getSummaryHistory({ group, name, year });
        if (getHistoryRevision(client, { group, name }) !== requestRevision) {
            return;
        }
        client.setQueryData<readonly Summary[]>(CATALOG_KEYS.summary, (summary = []) => {
            if (!summary.some((item) => item.group === group && item.name === name)) {
                return [...summary, { group, name, history: { [year]: history } }];
            }
            return summary.map((item) =>
                item.group === group && item.name === name
                    ? { ...item, history: { ...item.history, [year]: history } }
                    : item
            );
        });
        return history;
    }, [client, group, name, year]);
}
