import { useMemo } from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useGroups } from '~/client/state/groups/useGroups';

export function useVisibleGroups() {
    const groups = useGroups().map((v) => v.group);
    const [group] = useGroupFilter();
    return useMemo(() => (group ? [group] : groups), [group, groups]);
}
