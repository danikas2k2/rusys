import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { SetProductExpiryTolerance } from '~/schema';
import { setProductExpiryToleranceAction } from '~/server/actions/products';

export function useSetProductExpiryTolerance(): (request: SetProductExpiryTolerance) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetProductExpiryTolerance): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                await setProductExpiryToleranceAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
