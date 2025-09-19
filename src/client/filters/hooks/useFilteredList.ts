import { useMemo } from 'react';

import { type FilterPredicate } from '~/client/filters/types';

export function useFilteredList<T>(list: readonly T[], predicates: Record<string, FilterPredicate>): typeof list {
    return useMemo(
        () =>
            list.filter((v) => {
                for (const key in predicates) {
                    const predicate = predicates[key];
                    if (predicate && !predicate(v[key as keyof T])) {
                        return false;
                    }
                }
                return true;
            }),
        [list, predicates]
    );
}
