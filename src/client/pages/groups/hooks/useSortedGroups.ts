import type { Group } from '@rusys/common/data';
import { useMemo } from 'react';

import { useGroups } from '~/client/state/groups/useGroups';

export function useSortedGroups() {
    const groups = useGroups();
    return useMemo((): readonly Group[] => groups.toSorted((a, b) => a.order - b.order), [groups]);
}
