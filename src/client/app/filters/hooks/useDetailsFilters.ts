import { useGroupFilterPredicate } from '~/client/app/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/app/filters/hooks/useQuickFilterPredicate';
import { type FilterPredicate } from '~/client/app/filters/types';

export function useDetailsFilters(): Record<string, FilterPredicate> {
    return {
        name: useQuickFilterPredicate(),
        group: useGroupFilterPredicate(),
    };
}
