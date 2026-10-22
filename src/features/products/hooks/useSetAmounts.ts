import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { SetAmounts } from '~/schema';
import { setAmountsAction } from '~/server/actions/products';

export function useSetAmounts(): (request: SetAmounts) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetAmounts): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                await setAmountsAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
