import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import type { FilterPredicate } from '~/client/filters/types';

export function useDetailsFilters(): Record<string, FilterPredicate> {
    return {
        name: useQuickFilterPredicate(),
        group: useGroupFilterPredicate(),
    };
}
