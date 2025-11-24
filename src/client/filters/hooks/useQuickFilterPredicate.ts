import { useCallback } from 'react';

import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';
import type { FilterPredicate } from '~/client/filters/types';
import { matchParts } from '~/client/utils/matchParts';

export function useQuickFilterPredicate(): FilterPredicate<string> {
    const filter = useQuickFilter();
    return useCallback((v: string): boolean => !filter || matchParts(v, filter), [filter]);
}
