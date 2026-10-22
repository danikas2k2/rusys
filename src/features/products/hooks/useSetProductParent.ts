import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { SetProductParent } from '~/schema';
import { setProductParentAction } from '~/server/actions/products';

export function useSetProductParent(): (request: SetProductParent) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetProductParent): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                await setProductParentAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
