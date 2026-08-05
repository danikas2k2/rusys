import { isEmpty } from 'lodash';
import { useMemo } from 'react';

import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useProducts } from '~/client/state/products/useProducts';

// Nothing to physically confirm for a product with no recorded stock at all.
export function useGroupsWithReviewProducts(): ReadonlySet<string> {
    const products = useProducts();
    const quickFilter = useQuickFilterPredicate();
    return useMemo(
        () => new Set(products.filter((p) => !isEmpty(p.years) && quickFilter(p.name)).map(({ group }) => group)),
        [products, quickFilter]
    );
}
