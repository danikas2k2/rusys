import { useMemo } from 'react';

import type { Group } from '~/common/data';
import { useGroups } from '~/store/groups';

export function useSortedGroups() {
    const groups = useGroups();
    return useMemo((): readonly Group[] => groups.toSorted((a, b) => a.order - b.order), [groups]);
}
