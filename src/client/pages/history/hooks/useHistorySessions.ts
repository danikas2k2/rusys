import { useMemo } from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useHistory } from '~/client/state/history/useHistory';
import type { History } from '~/types/data';

export function useHistorySessions() {
    const history = useHistory();
    const quickFilter = useQuickFilterPredicate();
    const groupFilter = useGroupFilterPredicate();
    return useMemo(
        () =>
            history.reduce<Record<string, History[]>>((r, h) => {
                if (!groupFilter(h.group) || !quickFilter(h.name)) {
                    return r;
                }
                const s = `${h.sessionId || h.time}`;
                return { ...r, [s]: [...(r[s] ?? []), h] };
            }, {}),
        [groupFilter, history, quickFilter]
    );
}
