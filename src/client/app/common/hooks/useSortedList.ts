import { useMemo } from 'react';

import { compareNames } from '~/client/app/utils/compareNames';
import { useGroupComparator } from '~/client/state/groups/useGroupComparator';

export function useSortedList<T extends { group: string; name: string }>(list: ReadonlyArray<T>): typeof list {
    const compareGroups = useGroupComparator();
    return useMemo(
        () => [...list].sort((a, b) => compareGroups(a.group, b.group) || compareNames(a.name, b.name)),
        [compareGroups, list]
    );
}
