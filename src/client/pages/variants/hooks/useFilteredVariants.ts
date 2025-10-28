import { useMemo } from 'react';

import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';
import { useVariants } from '~/client/state/variants/useVariants';
import { matchParts } from '~/client/utils/matchParts';

export function useFilteredVariants() {
    const variants = useVariants();
    const group = useGroupFilter();
    const filter = useQuickFilter();
    return useMemo(
        () =>
            variants
                .filter((v) => !filter || matchParts(v.variant, filter))
                .filter((v) => !group || v.group === group)

                // Sort by group first, then by order within group
                // if (a.group !== b.group) {
                //     return visibleGroups.indexOf(a.group) - visibleGroups.indexOf(b.group);
                // }
                .sort((a, b) => a.order - b.order),
        [variants, filter, group]
    );
}
