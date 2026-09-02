import { useMemo } from 'react';

import { useGroups } from '~/client/state/groups/useGroups';
import type { Group } from '~/common/data';

export function useSortedGroups() {
    const groups = useGroups();
    return useMemo((): readonly Group[] => groups.toSorted((a, b) => a.order - b.order), [groups]);
}
