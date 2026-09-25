import { useCallback } from 'react';

import { useQuickFilter } from '~/features/filters/QuickFilterContext';
import type { FilterPredicate } from '~/features/filters/types';
import { matchParts } from '~/lib/utils/matchParts';

export function useQuickFilterPredicate(): FilterPredicate<string> {
    const [filter] = useQuickFilter();
    return useCallback((v: string): boolean => !filter || matchParts(v, filter), [filter]);
}
