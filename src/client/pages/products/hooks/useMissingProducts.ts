import { useMemo } from 'react';

import type { Product } from '~/types/data';

export function useMissingProducts(products: readonly Product[]): typeof products {
    return useMemo(() => products.filter((v) => v.missing), [products]);
}
