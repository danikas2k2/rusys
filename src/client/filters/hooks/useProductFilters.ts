import { useMemo } from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import type { FilterPredicate } from '~/client/filters/types';

export function useProductFilters(): Record<string, FilterPredicate> {
    const name = useQuickFilterPredicate();
    const group = useGroupFilterPredicate();

    return useMemo(
        () => ({
            name,
            group,
        }),
        [name, group]
    );
}
