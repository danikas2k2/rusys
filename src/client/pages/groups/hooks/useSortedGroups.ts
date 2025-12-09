import { useMemo } from 'react';

import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { matchParts } from '~/client/utils/matchParts';

export function useSortedGroups() {
    const groups = useGroups();
    return useMemo(() => [...groups].sort((a, b) => a.order - b.order), [groups]);
}
