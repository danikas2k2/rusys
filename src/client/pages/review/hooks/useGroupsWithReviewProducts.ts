import { isEmpty } from 'lodash';
import { useMemo } from 'react';

import { useProducts } from '~/client/state/products/useProducts';

// Nothing to physically confirm for a product with no recorded stock at all.
export function useGroupsWithReviewProducts(): ReadonlySet<string> {
    const products = useProducts();
    return useMemo(() => new Set(products.filter((p) => !isEmpty(p.years)).map(({ group }) => group)), [products]);
}
