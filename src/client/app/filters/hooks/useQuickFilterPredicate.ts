import { useCallback } from 'react';

import { useQuickFilter } from '~/client/app/filters/hooks/useQuickFilter';
import { type FilterPredicate } from '~/client/app/filters/types';
import { matchParts } from '~/client/app/utils/matchParts';

export function useQuickFilterPredicate(): FilterPredicate<string> {
    const filter = useQuickFilter();
    return useCallback((v: string): boolean => !filter || matchParts(v, filter), [filter]);
}
