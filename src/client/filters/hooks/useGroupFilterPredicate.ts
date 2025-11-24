import { useCallback } from 'react';

import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import type { FilterPredicate } from '~/client/filters/types';

export function useGroupFilterPredicate(): FilterPredicate<string> {
    const group = useGroupFilter();
    return useCallback((v: string): boolean => !group || v === group, [group]);
}
