import { useMemo } from 'react';

import { useSummary } from '~/client/state/summary/useSummary';

export function useGroupsWithSummary(): ReadonlySet<string> {
    const summary = useSummary();
    return useMemo(() => new Set(summary.map(({ group }) => group)), [summary]);
}
