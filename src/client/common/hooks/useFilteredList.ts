import { useMemo } from 'react';

import { matchParts } from '~/client/utils/matchParts';
import { useFilter } from '~/state/filter/useFilter';
import { useGroup } from '~/state/group/useGroup';

export function useFilteredList<T extends { group: string; name: string }>(list: readonly T[]): T[] {
    const group = useGroup();
    const filter = useFilter();
    return useMemo(
        () => list.filter((v) => (!group || v.group === group) && (!filter || matchParts(v.name, filter))),
        [list, filter, group]
    );
}
