import { useMemo } from 'react';

import { useHistory } from '~/client/state/history/useHistory';
import type { History } from '~/types/data';

export function useHistorySessions() {
    const history = useHistory();
    return useMemo(
        () =>
            history.reduce<Record<string, History[]>>((r, h) => {
                const s = `${h.sessionId || h.time}`;
                return { ...r, [s]: [...(r[s] ?? []), h] };
            }, {}),
        [history]
    );
}
