import { useMemo } from 'react';

import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { useProducts } from '~/client/state/products/useProducts';

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
