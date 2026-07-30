import { useMemo } from 'react';

import { useProducts } from '~/client/state/products/useProducts';

export function useGroupsWithProducts(): ReadonlySet<string> {
    const products = useProducts();
    return useMemo(() => new Set(products.map(({ group }) => group)), [products]);
}
