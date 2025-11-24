import { useMemo } from 'react';

import { useGroupComparator } from '~/client/state/groups/useGroupComparator';
import { compareNames } from '~/client/utils/compareNames';

export function useSortedList<T extends { group: string; name: string }>(list: readonly T[]): typeof list {
    const compareGroups = useGroupComparator();
    return useMemo(
        () => [...list].sort((a, b) => compareGroups(a.group, b.group) || compareNames(a.name, b.name)),
        [compareGroups, list]
    );
}
