import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { ProductIdentity } from '~/schema';
import { readProductConsumptionYears } from '~/server/actions/summary';
import { useProducts } from '~/store/products';

export function useProductConsumptionYears({ group, name }: ProductIdentity) {
    const products = useProducts();
    const query = useQuery({
        queryKey: ['product-consumption-years', group, name],
        queryFn: () => readProductConsumptionYears({ group, name }),
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
