import { useMemo } from 'react';

import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { matchParts } from '~/client/utils/matchParts';

export function useFilteredGroups() {
    const groups = useGroups();
    const [filter] = useQuickFilter();
    return useMemo(
        () => groups.filter((v) => matchParts(v.group, filter)).sort((a, b) => a.order - b.order),
        [filter, groups]
    );
}
