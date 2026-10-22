import { useQuery } from '@tanstack/react-query';

import { getProductsAction } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';

export const useYears = (n?: number): readonly number[] =>
    (
        useQuery({
            queryKey: CATALOG_KEYS.years,
            queryFn: async () => (await getProductsAction()).years,
            enabled: false,
        }).data ?? []
    ).slice(0, n);
