import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { setProductExpiryToleranceAction } from '~/server/actions/products';

export function useSetProductExpiryTolerance(): (
    group: string,
    name: string,
    expiryToleranceDays: number
) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, expiryToleranceDays: number): Promise<void> => {
            if (group && name) {
                await setProductExpiryToleranceAction(group, name, expiryToleranceDays);
                await refresh();
            }
        },
        [refresh]
    );
}
