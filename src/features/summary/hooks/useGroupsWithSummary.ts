import { useMemo } from 'react';

import type { FilterPredicate } from '~/features/filters/types';
import { useSummary } from '~/store/summary/useSummary';

export function useGroupsWithSummary(predicate: FilterPredicate<string> = () => true): ReadonlySet<string> {
    const summary = useSummary();
    return useMemo(
        () => new Set(summary.filter(({ name }) => predicate(name)).map(({ group }) => group)),
        [summary, predicate]
    );
}
