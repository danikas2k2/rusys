import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { ProductYearIdentity } from '~/schema';
import { readProductSummary } from '~/server/actions/summary';
import { useProducts } from '~/store/products';

export function useProductSummaryAmounts({ group, name, year }: ProductYearIdentity) {
    const products = useProducts();
    const query = useQuery({
        queryKey: ['product-summary', group, name, year],
        queryFn: () => readProductSummary({ group, name, year }),
        enabled: !!group && !!name,
    });
    const { refetch } = query;
    useEffect(() => {
        if (group && name) {
            void refetch();
        }
    }, [refetch, group, name, products]);
    return query;
}
