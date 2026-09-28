import { useMemo } from 'react';

import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useMissingOnly } from '~/features/products/MissingOnlyContext';
import { useProducts } from '~/store/products/useProducts';

export function useGroupsWithProducts(): ReadonlySet<string> {
    const products = useProducts();
    const quickFilter = useQuickFilterPredicate();
    const [missingOnly] = useMissingOnly();
    return useMemo(
        () =>
            new Set(
                products.filter((p) => quickFilter(p.name) && (!missingOnly || p.missing)).map(({ group }) => group)
            ),
        [products, quickFilter, missingOnly]
    );
}
