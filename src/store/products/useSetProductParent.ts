import { useCallback } from 'react';

import { setProductParentAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';

export function useSetProductParent(): (group: string, name: string, parent?: string) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, parent?: string): Promise<void> => {
            if (group && name) {
                await setProductParentAction(group, name, parent);
                await refresh();
            }
        },
        [refresh]
    );
}
