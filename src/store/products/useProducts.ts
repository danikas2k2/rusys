import { useQuery } from '@tanstack/react-query';

import type { Product } from '~/schema';
import { getProductsAction } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';

const EMPTY_PRODUCTS: readonly Product[] = [];

export const useProducts = (): readonly Product[] =>
    useQuery({
        queryKey: CATALOG_KEYS.products,
        queryFn: async () => (await getProductsAction()).products,
        enabled: false,
    }).data ?? EMPTY_PRODUCTS;
