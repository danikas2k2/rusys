import { useQuery } from '@tanstack/react-query';

import type { Summary } from '~/schema';
import { readSummary } from '~/server/actions/summary';
import { CATALOG_KEYS } from '~/store/catalog';

const emptySummary: readonly Summary[] = [];

export const useSummary = (): readonly Summary[] =>
    useQuery({ queryKey: CATALOG_KEYS.summary, queryFn: async () => (await readSummary()).summary, enabled: false })
        .data ?? emptySummary;
