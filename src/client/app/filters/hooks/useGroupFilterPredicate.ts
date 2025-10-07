import { useCallback } from 'react';

import { useGroupFilter } from '~/client/app/filters/hooks/useGroupFilter';
import { type FilterPredicate } from '~/client/app/filters/types';

export function useGroupFilterPredicate(): FilterPredicate<string> {
    const group = useGroupFilter();
    return useCallback((v: string): boolean => !group || v === group, [group]);
}
