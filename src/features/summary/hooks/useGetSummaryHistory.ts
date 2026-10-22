import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { Summary } from '~/common/data';
import type * as schema from '~/schema';
import { getSummaryHistory } from '~/server/actions/summary';
import { CATALOG_KEYS } from '~/store/catalog';

export function useGetSummaryHistory(request: schema.ProductYearIdentity): () => Promise<void> {
    const client = useQueryClient();
    const { group, name, year } = request;
    return useCallback(async (): Promise<void> => {
        if (!group || !name) {
            return;
        }
        const history = await getSummaryHistory({ group, name, year });
        client.setQueryData<readonly Summary[]>(CATALOG_KEYS.summary, (summary) =>
            summary?.map((item) =>
                item.group === group && item.name === name
                    ? { ...item, history: { ...item.history, [year]: history } }
                    : item
            )
        );
    }, [client, group, name, year]);
}
